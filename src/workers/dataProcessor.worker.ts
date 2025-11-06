/**
 * Web Worker for processing vulnerability data in background thread
 * Handles JSON parsing, flattening, and initial metric calculations
 * without blocking the main UI thread
 */

import type {
  VulnerabilityData,
  FlattenedVulnerability,
  VulnerabilityMetrics,
} from "../types/vulnerability";

interface WorkerMessage {
  type: "PROCESS_JSON" | "CALCULATE_METRICS" | "FILTER_DATA";
  payload: any;
}

interface ProgressMessage {
  type: "PROGRESS";
  progress: number;
  message: string;
}

interface ResultMessage {
  type: "RESULT" | "METRICS" | "FILTERED";
  data: any;
}

/**
 * Flatten nested vulnerability data into queryable structure
 */
function flattenVulnerabilities(
  data: VulnerabilityData
): FlattenedVulnerability[] {
  const flattened: FlattenedVulnerability[] = [];
  let processedGroups = 0;
  const totalGroups = Object.keys(data.groups).length;
  let totalVulnCount = 0;

  for (const [groupName, group] of Object.entries(data.groups)) {
    for (const [repoName, repo] of Object.entries(group.repos)) {
      for (const [imageName, image] of Object.entries(repo.images)) {
        const vulns = image.vulnerabilities || [];
        for (let i = 0; i < vulns.length; i++) {
          const vuln = vulns[i];
          totalVulnCount++;

          // Create unique composite ID with index to handle duplicates
          const id = `${groupName}|${repoName}|${imageName}|${vuln.cve}|${vuln.packageName}|${i}`;

          flattened.push({
            ...vuln,
            id,
            groupName,
            repoName,
            imageName,
            imageCreateTime: image.createTime,
            // Parse dates for filtering
            publishedDate: vuln.published
              ? new Date(vuln.published)
              : undefined,
            fixedDate: vuln.fixDate ? new Date(vuln.fixDate) : undefined,
            layerDate: vuln.layerTime ? new Date(vuln.layerTime) : undefined,
          });
        }
      }
    }

    processedGroups++;
    // Send progress updates
    if (processedGroups % 10 === 0 || processedGroups === totalGroups) {
      self.postMessage({
        type: "PROGRESS",
        progress: (processedGroups / totalGroups) * 50, // First 50% for flattening
        message: `Processing group ${processedGroups}/${totalGroups} - ${totalVulnCount} vulnerabilities`,
      } as ProgressMessage);
    }
  }

  return flattened;
}

/**
 * Calculate aggregated metrics from vulnerability data
 */
function calculateMetrics(
  vulnerabilities: FlattenedVulnerability[]
): VulnerabilityMetrics {
  const metrics: VulnerabilityMetrics = {
    total: vulnerabilities.length,
    bySeverity: {},
    byKaiStatus: {},
    byRiskFactor: {},
    byPackageType: {},
    cvssDistribution: [],
    timeline: [],
    topPackages: [],
    topRepos: [],
    criticalHighlights: [],
  };

  // Count by severity
  for (const vuln of vulnerabilities) {
    metrics.bySeverity[vuln.severity] =
      (metrics.bySeverity[vuln.severity] || 0) + 1;
    metrics.byKaiStatus[vuln.kaiStatus] =
      (metrics.byKaiStatus[vuln.kaiStatus] || 0) + 1;
    metrics.byPackageType[vuln.packageType] =
      (metrics.byPackageType[vuln.packageType] || 0) + 1;

    // Count risk factors
    for (const factor of Object.keys(vuln.riskFactors || {})) {
      metrics.byRiskFactor[factor] = (metrics.byRiskFactor[factor] || 0) + 1;
    }
  }

  // CVSS distribution (0-3, 3-5, 5-7, 7-9, 9-10)
  const cvssRanges = [
    { range: "0-3", min: 0, max: 3, count: 0 },
    { range: "3-5", min: 3, max: 5, count: 0 },
    { range: "5-7", min: 5, max: 7, count: 0 },
    { range: "7-9", min: 7, max: 9, count: 0 },
    { range: "9-10", min: 9, max: 10.1, count: 0 },
  ];

  for (const vuln of vulnerabilities) {
    for (const range of cvssRanges) {
      if (vuln.cvss >= range.min && vuln.cvss < range.max) {
        range.count++;
        break;
      }
    }
  }

  metrics.cvssDistribution = cvssRanges;

  // Timeline (monthly aggregation with severity breakdown)
  const monthlyCount = new Map<
    string,
    {
      count: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
    }
  >();

  for (const vuln of vulnerabilities) {
    if (vuln.publishedDate) {
      const monthKey = `${vuln.publishedDate.getFullYear()}-${String(
        vuln.publishedDate.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyCount.has(monthKey)) {
        monthlyCount.set(monthKey, {
          count: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
        });
      }

      const data = monthlyCount.get(monthKey)!;
      data.count++;

      // Normalize severity to lowercase and match
      const rawSeverity = vuln.severity;
      const severity = rawSeverity
        ? String(rawSeverity).toLowerCase().trim()
        : "";

      if (severity === "critical") {
        data.critical++;
      } else if (severity === "high") {
        data.high++;
      } else if (severity === "medium") {
        data.medium++;
      } else if (severity === "low" || severity === "negligible") {
        // Group negligible with low
        data.low++;
      }
    }
  }

  metrics.timeline = Array.from(monthlyCount.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-24); // Last 24 months

  // Top packages
  const packageCount = new Map<string, number>();
  for (const vuln of vulnerabilities) {
    packageCount.set(
      vuln.packageName,
      (packageCount.get(vuln.packageName) || 0) + 1
    );
  }

  metrics.topPackages = Array.from(packageCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Top repos
  const repoCount = new Map<string, number>();
  for (const vuln of vulnerabilities) {
    repoCount.set(vuln.repoName, (repoCount.get(vuln.repoName) || 0) + 1);
  }

  metrics.topRepos = Array.from(repoCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Critical highlights (high/critical with exploits or recent)
  metrics.criticalHighlights = vulnerabilities
    .filter(
      (v) =>
        (v.severity === "critical" || v.severity === "high") &&
        (v.exploit || v.cvss >= 8.0)
    )
    .sort((a, b) => b.cvss - a.cvss)
    .slice(0, 10);

  return metrics;
}

/**
 * Filter vulnerabilities based on criteria
 */
function filterVulnerabilities(
  vulnerabilities: FlattenedVulnerability[],
  filters: any
): FlattenedVulnerability[] {
  return vulnerabilities.filter((vuln) => {
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchable =
        `${vuln.cve} ${vuln.packageName} ${vuln.description}`.toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    // Severity filter
    if (
      filters.severities?.length > 0 &&
      !filters.severities.includes(vuln.severity)
    ) {
      return false;
    }

    // KaiStatus filter
    if (
      filters.kaiStatuses?.length > 0 &&
      !filters.kaiStatuses.includes(vuln.kaiStatus)
    ) {
      return false;
    }

    // Analysis filters
    // Handle both formats: "invalid - norisk" and "invalid-norisk"
    if (filters.excludeInvalidNoRisk) {
      const status = vuln.kaiStatus?.toLowerCase().replace(/\s+/g, "-");
      if (status === "invalid-norisk") {
        return false;
      }
    }

    if (filters.excludeAiInvalidNoRisk) {
      const status = vuln.kaiStatus?.toLowerCase().replace(/\s+/g, "-");
      if (status === "ai-invalid-norisk") {
        return false;
      }
    }

    // CVSS range
    if (filters.cvssRange) {
      const [min, max] = filters.cvssRange;
      if (vuln.cvss < min || vuln.cvss > max) return false;
    }

    // Package names
    if (
      filters.packageNames?.length > 0 &&
      !filters.packageNames.includes(vuln.packageName)
    ) {
      return false;
    }

    return true;
  });
}

// Worker message handler
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case "PROCESS_JSON": {
        self.postMessage({
          type: "PROGRESS",
          progress: 10,
          message: "Parsing JSON data...",
        } as ProgressMessage);

        // Parse JSON if it's a string
        const data: VulnerabilityData =
          typeof payload === "string" ? JSON.parse(payload) : payload;

        self.postMessage({
          type: "PROGRESS",
          progress: 20,
          message: "Flattening vulnerability data...",
        } as ProgressMessage);

        // Flatten nested structure
        const flattened = flattenVulnerabilities(data);

        self.postMessage({
          type: "PROGRESS",
          progress: 70,
          message: "Calculating metrics...",
        } as ProgressMessage);

        // Calculate metrics
        const metrics = calculateMetrics(flattened);

        self.postMessage({
          type: "PROGRESS",
          progress: 100,
          message: "Processing complete!",
        } as ProgressMessage);

        // Send results
        self.postMessage({
          type: "RESULT",
          data: { vulnerabilities: flattened, metrics },
        } as ResultMessage);
        break;
      }

      case "CALCULATE_METRICS": {
        const metrics = calculateMetrics(payload);
        self.postMessage({
          type: "METRICS",
          data: metrics,
        } as ResultMessage);
        break;
      }

      case "FILTER_DATA": {
        const { vulnerabilities, filters } = payload;
        const filtered = filterVulnerabilities(vulnerabilities, filters);
        self.postMessage({
          type: "FILTERED",
          data: filtered,
        } as ResultMessage);
        break;
      }
    }
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export {};
