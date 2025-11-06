/**
 * IndexedDB utilities for storing and querying large vulnerability dataset
 * Provides persistent client-side storage with indexed queries
 */

import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";
import type {
  FlattenedVulnerability,
  VulnerabilityMetrics,
} from "../types/vulnerability";

interface VulnDBSchema extends DBSchema {
  vulnerabilities: {
    key: string;
    value: FlattenedVulnerability;
    indexes: {
      "by-severity": string;
      "by-kaiStatus": string;
      "by-cvss": number;
      "by-packageName": string;
      "by-group": string;
      "by-repo": string;
      "by-published": number;
    };
  };
  metadata: {
    key: string;
    value: {
      key: string;
      lastUpdated: number;
      totalCount: number;
      version: number;
    };
  };
  metrics: {
    key: string;
    value: VulnerabilityMetrics;
  };
}

const DB_NAME = "VulnerabilityDB";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<VulnDBSchema> | null = null;

/**
 * Initialize and open the IndexedDB database
 */
export async function initDB(): Promise<IDBPDatabase<VulnDBSchema>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<VulnDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create vulnerabilities store with indexes for fast queries
      if (!db.objectStoreNames.contains("vulnerabilities")) {
        const vulnStore = db.createObjectStore("vulnerabilities", {
          keyPath: "id",
        });
        vulnStore.createIndex("by-severity", "severity");
        vulnStore.createIndex("by-kaiStatus", "kaiStatus");
        vulnStore.createIndex("by-cvss", "cvss");
        vulnStore.createIndex("by-packageName", "packageName");
        vulnStore.createIndex("by-group", "groupName");
        vulnStore.createIndex("by-repo", "repoName");
        vulnStore.createIndex("by-published", "publishedDate");
      }

      // Create metadata store
      if (!db.objectStoreNames.contains("metadata")) {
        db.createObjectStore("metadata", { keyPath: "key" });
      }

      // Create metrics store for cached aggregations
      if (!db.objectStoreNames.contains("metrics")) {
        db.createObjectStore("metrics", { keyPath: "key" });
      }
    },
  });

  return dbInstance;
}

/**
 * Batch insert vulnerabilities (chunked for performance)
 */
export async function bulkInsertVulnerabilities(
  vulnerabilities: FlattenedVulnerability[],
  onProgress?: (progress: number) => void
): Promise<void> {
  const db = await initDB();
  const CHUNK_SIZE = 1000;

  for (let i = 0; i < vulnerabilities.length; i += CHUNK_SIZE) {
    const chunk = vulnerabilities.slice(i, i + CHUNK_SIZE);
    const tx = db.transaction("vulnerabilities", "readwrite");

    await Promise.all([...chunk.map((vuln) => tx.store.put(vuln)), tx.done]);

    if (onProgress) {
      const progress = Math.min(
        ((i + CHUNK_SIZE) / vulnerabilities.length) * 100,
        100
      );
      onProgress(progress);
    }
  }

  // Update metadata
  await db.put("metadata", {
    key: "main",
    lastUpdated: Date.now(),
    totalCount: vulnerabilities.length,
    version: DB_VERSION,
  });
}

/**
 * Get all vulnerabilities (use sparingly, prefer filtered queries)
 */
export async function getAllVulnerabilities(): Promise<
  FlattenedVulnerability[]
> {
  const db = await initDB();
  const vulnerabilities = await db.getAll("vulnerabilities");

  // Rehydrate Date objects (IndexedDB serializes them)
  return vulnerabilities.map((vuln) => ({
    ...vuln,
    publishedDate: vuln.publishedDate
      ? new Date(vuln.publishedDate)
      : undefined,
    fixedDate: vuln.fixedDate ? new Date(vuln.fixedDate) : undefined,
    layerDate: vuln.layerDate ? new Date(vuln.layerDate) : undefined,
  }));
}

/**
 * Get vulnerabilities with pagination
 */
export async function getVulnerabilitiesPaginated(
  offset: number,
  limit: number
): Promise<FlattenedVulnerability[]> {
  const db = await initDB();
  const tx = db.transaction("vulnerabilities", "readonly");
  const store = tx.objectStore("vulnerabilities");

  const all = await store.getAll();
  return all.slice(offset, offset + limit);
}

/**
 * Query vulnerabilities by severity
 */
export async function getVulnerabilitiesBySeverity(
  severity: string
): Promise<FlattenedVulnerability[]> {
  const db = await initDB();
  const index = db.transaction("vulnerabilities").store.index("by-severity");
  return index.getAll(severity);
}

/**
 * Query vulnerabilities by kaiStatus
 */
export async function getVulnerabilitiesByKaiStatus(
  kaiStatus: string
): Promise<FlattenedVulnerability[]> {
  const db = await initDB();
  const index = db.transaction("vulnerabilities").store.index("by-kaiStatus");
  return index.getAll(kaiStatus);
}

/**
 * Get vulnerability by ID
 */
export async function getVulnerabilityById(
  id: string
): Promise<FlattenedVulnerability | undefined> {
  const db = await initDB();
  return db.get("vulnerabilities", id);
}

/**
 * Count total vulnerabilities
 */
export async function countVulnerabilities(): Promise<number> {
  const db = await initDB();
  return db.count("vulnerabilities");
}

/**
 * Check if database is populated
 */
export async function isDatabasePopulated(): Promise<boolean> {
  const db = await initDB();
  const metadata = await db.get("metadata", "main");
  return !!metadata && metadata.totalCount > 0;
}

/**
 * Clear all data (for reimport)
 */
export async function clearDatabase(): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(
    ["vulnerabilities", "metadata", "metrics"],
    "readwrite"
  );
  await Promise.all([
    tx.objectStore("vulnerabilities").clear(),
    tx.objectStore("metadata").clear(),
    tx.objectStore("metrics").clear(),
    tx.done,
  ]);
}

/**
 * Store computed metrics for fast retrieval
 */
export async function storeMetrics(
  metrics: VulnerabilityMetrics
): Promise<void> {
  const db = await initDB();
  await db.put("metrics", { ...metrics, key: "cached" } as any);
}

/**
 * Retrieve cached metrics
 */
export async function getCachedMetrics(): Promise<
  VulnerabilityMetrics | undefined
> {
  const db = await initDB();
  return db.get("metrics", "cached");
}

/**
 * Get database size estimation (in MB)
 */
export async function estimateDatabaseSize(): Promise<number> {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return (estimate.usage || 0) / (1024 * 1024); // Convert to MB
  }
  return 0;
}
