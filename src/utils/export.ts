/**
 * Export utilities for CSV, JSON, and Excel formats
 */

import type { FlattenedVulnerability } from "../types/vulnerability";

/**
 * Export vulnerabilities to CSV format
 */
export function exportToCSV(
  data: FlattenedVulnerability[],
  filename: string
): void {
  // CSV Headers
  const headers = [
    "CVE ID",
    "Severity",
    "CVSS Score",
    "Package Name",
    "Package Version",
    "Package Type",
    "KAI Status",
    "Status",
    "Group",
    "Repository",
    "Image",
    "Published Date",
    "Fix Date",
    "Layer Time",
    "Exploit",
    "Description",
    "Link",
  ];

  // Convert data to CSV rows
  const rows = data.map((vuln) => [
    vuln.cve,
    vuln.severity.toUpperCase(),
    vuln.cvss?.toString() || "",
    vuln.packageName,
    vuln.packageVersion,
    vuln.packageType,
    vuln.kaiStatus,
    vuln.status,
    vuln.groupName,
    vuln.repoName,
    vuln.imageName,
    vuln.published || "",
    vuln.fixDate || "",
    vuln.layerTime || "",
    vuln.exploit || "",
    `"${(vuln.description || "").replace(/"/g, '""')}"`, // Escape quotes
    vuln.link || "",
  ]);

  // Combine headers and rows
  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
    "\n"
  );

  // Create and download file
  downloadFile(csv, filename, "text/csv");
}

/**
 * Export vulnerabilities to JSON format
 */
export function exportToJSON(
  data: FlattenedVulnerability[],
  filename: string
): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, "application/json");
}

/**
 * Helper function to trigger file download
 */
function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
