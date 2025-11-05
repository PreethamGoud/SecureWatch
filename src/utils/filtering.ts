/**
 * Filtering and querying utilities for vulnerability data
 * Provides efficient in-memory filtering with multiple criteria
 */

import type {
  FlattenedVulnerability,
  FilterCriteria,
  SortConfig,
} from "../types/vulnerability";

/**
 * Apply all filter criteria to vulnerability dataset
 */
export function applyFilters(
  vulnerabilities: FlattenedVulnerability[],
  filters: FilterCriteria
): FlattenedVulnerability[] {
  return vulnerabilities.filter((vuln) => {
    // Search query (case-insensitive, across multiple fields)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = [
        vuln.cve,
        vuln.packageName,
        vuln.description,
        vuln.groupName,
        vuln.repoName,
      ]
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // Severity filter (only apply if explicitly set and not all selected)
    if (filters.severities && filters.severities.length > 0) {
      // Case-insensitive comparison
      const normalizedSeverities = filters.severities.map((s) =>
        s.toLowerCase()
      );
      if (!normalizedSeverities.includes(vuln.severity.toLowerCase())) {
        return false;
      }
    }

    // KaiStatus filter
    if (filters.kaiStatuses && filters.kaiStatuses.length > 0) {
      if (!filters.kaiStatuses.includes(vuln.kaiStatus)) {
        return false;
      }
    }

    // Analysis filters (key feature!)
    if (filters.excludeInvalidNoRisk && vuln.kaiStatus === "invalid - norisk") {
      return false;
    }

    if (
      filters.excludeAiInvalidNoRisk &&
      vuln.kaiStatus === "ai-invalid-norisk"
    ) {
      return false;
    }

    // CVSS range filter
    if (filters.cvssRange) {
      const [min, max] = filters.cvssRange;
      if (vuln.cvss < min || vuln.cvss > max) {
        return false;
      }
    }

    // Package names filter (partial match for search, exact for multi-select)
    if (filters.packageNames && filters.packageNames.length > 0) {
      // If it's a search query (single item), do partial match
      if (filters.packageNames.length === 1 && filters.packageNames[0]) {
        const searchTerm = filters.packageNames[0].toLowerCase();
        if (!vuln.packageName.toLowerCase().includes(searchTerm)) {
          return false;
        }
      } else {
        // Multiple selections: exact match
        if (!filters.packageNames.includes(vuln.packageName)) {
          return false;
        }
      }
    }

    // Package types filter
    if (filters.packageTypes && filters.packageTypes.length > 0) {
      if (!filters.packageTypes.includes(vuln.packageType)) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange) {
      if (filters.dateRange.start && vuln.publishedDate) {
        if (vuln.publishedDate < filters.dateRange.start) {
          return false;
        }
      }
      if (filters.dateRange.end && vuln.publishedDate) {
        if (vuln.publishedDate > filters.dateRange.end) {
          return false;
        }
      }
    }

    // Groups filter
    if (filters.groups && filters.groups.length > 0) {
      if (!filters.groups.includes(vuln.groupName)) {
        return false;
      }
    }

    // Repos filter
    if (filters.repos && filters.repos.length > 0) {
      if (!filters.repos.includes(vuln.repoName)) {
        return false;
      }
    }

    // Risk factors filter
    if (filters.riskFactors && filters.riskFactors.length > 0) {
      const vulnRiskFactors = vuln.riskFactors
        ? Object.keys(vuln.riskFactors)
        : [];
      const hasAnyRiskFactor = filters.riskFactors.some((rf) =>
        vulnRiskFactors.includes(rf)
      );
      if (!hasAnyRiskFactor) {
        return false;
      }
    }

    // Has exploit filter
    if (filters.hasExploit !== undefined) {
      const hasExploit = vuln.exploit && vuln.exploit.length > 0;
      if (filters.hasExploit !== hasExploit) {
        return false;
      }
    }

    // Has fix filter
    if (filters.hasFix !== undefined) {
      const hasFix = vuln.fixDate && vuln.fixDate.length > 0;
      if (filters.hasFix !== hasFix) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort vulnerabilities by specified field and direction
 */
export function sortVulnerabilities(
  vulnerabilities: FlattenedVulnerability[],
  sortConfig: SortConfig
): FlattenedVulnerability[] {
  return [...vulnerabilities].sort((a, b) => {
    const aVal = a[sortConfig.field];
    const bVal = b[sortConfig.field];

    if (aVal === bVal) return 0;

    let comparison = 0;
    if (typeof aVal === "string" && typeof bVal === "string") {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === "number" && typeof bVal === "number") {
      comparison = aVal - bVal;
    } else if (aVal instanceof Date && bVal instanceof Date) {
      comparison = aVal.getTime() - bVal.getTime();
    }

    return sortConfig.direction === "asc" ? comparison : -comparison;
  });
}

/**
 * Paginate vulnerability results
 */
export function paginateResults(
  vulnerabilities: FlattenedVulnerability[],
  page: number,
  pageSize: number
): FlattenedVulnerability[] {
  const start = page * pageSize;
  return vulnerabilities.slice(start, start + pageSize);
}

/**
 * Get unique values for a field (for filter options)
 */
export function getUniqueValues<K extends keyof FlattenedVulnerability>(
  vulnerabilities: FlattenedVulnerability[],
  field: K
): string[] {
  const values = new Set<string>();
  for (const vuln of vulnerabilities) {
    const value = vuln[field];
    if (value && typeof value === "string") {
      values.add(value);
    }
  }
  return Array.from(values).sort();
}

/**
 * Get filter suggestions based on partial query
 */
export function getFilterSuggestions(
  vulnerabilities: FlattenedVulnerability[],
  query: string,
  limit = 10
): Array<{ type: string; value: string; label: string }> {
  const suggestions: Array<{ type: string; value: string; label: string }> = [];
  const queryLower = query.toLowerCase();

  // Search CVEs
  const cveMatches = vulnerabilities
    .filter((v) => v.cve.toLowerCase().includes(queryLower))
    .slice(0, limit);
  cveMatches.forEach((v) => {
    suggestions.push({
      type: "CVE",
      value: v.cve,
      label: `${v.cve} (${v.severity})`,
    });
  });

  // Search packages
  const packageSet = new Set<string>();
  vulnerabilities
    .filter((v) => v.packageName.toLowerCase().includes(queryLower))
    .forEach((v) => packageSet.add(v.packageName));
  Array.from(packageSet)
    .slice(0, limit)
    .forEach((pkg) => {
      suggestions.push({
        type: "Package",
        value: pkg,
        label: pkg,
      });
    });

  return suggestions.slice(0, limit);
}

/**
 * Calculate impact of filters (how many items removed)
 */
export function calculateFilterImpact(
  originalCount: number,
  filteredCount: number
): {
  removed: number;
  remaining: number;
  percentageRemoved: number;
  percentageRemaining: number;
} {
  const removed = originalCount - filteredCount;
  const percentageRemoved =
    originalCount > 0 ? (removed / originalCount) * 100 : 0;
  const percentageRemaining = 100 - percentageRemoved;

  return {
    removed,
    remaining: filteredCount,
    percentageRemoved,
    percentageRemaining,
  };
}

/**
 * Count vulnerabilities by severity for quick stats
 */
export function countBySeverity(
  vulnerabilities: FlattenedVulnerability[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const vuln of vulnerabilities) {
    counts[vuln.severity] = (counts[vuln.severity] || 0) + 1;
  }
  return counts;
}

/**
 * Get high-priority vulnerabilities (critical/high with high CVSS)
 */
export function getHighPriorityVulnerabilities(
  vulnerabilities: FlattenedVulnerability[],
  limit = 20
): FlattenedVulnerability[] {
  return vulnerabilities
    .filter(
      (v) =>
        (v.severity === "critical" || v.severity === "high") && v.cvss >= 7.0
    )
    .sort((a, b) => b.cvss - a.cvss)
    .slice(0, limit);
}
