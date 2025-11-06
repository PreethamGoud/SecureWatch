/**
 * Data loading utilities for handling large JSON files
 * Manages chunked loading, Web Worker processing, and IndexedDB storage
 */

import type {
  FlattenedVulnerability,
  VulnerabilityMetrics,
  DataLoadingState,
} from "../types/vulnerability";
import {
  bulkInsertVulnerabilities,
  isDatabasePopulated,
  storeMetrics,
  getCachedMetrics,
} from "./indexedDB";

/**
 * Load and process vulnerability data
 * Uses Web Worker for heavy processing to keep UI responsive
 */
export class DataLoader {
  private worker: Worker | null = null;
  private loadingState: DataLoadingState = {
    status: "idle",
    progress: 0,
    message: "",
  };
  private listeners: Set<(state: DataLoadingState) => void> = new Set();

  constructor() {
    this.initWorker();
  }

  /**
   * Initialize Web Worker for background processing
   */
  private initWorker() {
    try {
      // Create worker from separate file
      this.worker = new Worker(
        new URL("../workers/dataProcessor.worker.ts", import.meta.url),
        { type: "module" }
      );

      this.worker.onmessage = (event) => {
        this.handleWorkerMessage(event.data);
      };

      this.worker.onerror = (error) => {
        this.updateState({
          status: "error",
          progress: 0,
          message: "Worker error",
          error: error.message,
        });
      };
    } catch (error) {
      console.error("Failed to initialize worker:", error);
    }
  }

  /**
   * Handle messages from Web Worker
   */
  private handleWorkerMessage(message: any) {
    switch (message.type) {
      case "PROGRESS":
        this.updateState({
          ...this.loadingState,
          progress: message.progress,
          message: message.message,
        });
        break;

      case "RESULT":
        this.handleProcessingComplete(message.data);
        break;

      case "ERROR":
        this.updateState({
          status: "error",
          progress: 0,
          message: "Processing failed",
          error: message.error,
        });
        break;
    }
  }

  /**
   * Handle completion of data processing
   */
  private async handleProcessingComplete(data: {
    vulnerabilities: FlattenedVulnerability[];
    metrics: VulnerabilityMetrics;
  }) {
    try {
      this.updateState({
        status: "processing",
        progress: 80,
        message: "Storing data in IndexedDB...",
      });

      // Store in IndexedDB for persistent access
      await bulkInsertVulnerabilities(data.vulnerabilities, (progress) => {
        this.updateState({
          status: "processing",
          progress: 80 + progress * 0.15, // 80-95%
          message: "Storing vulnerabilities...",
        });
      });

      // Store metrics
      await storeMetrics(data.metrics);

      this.updateState({
        status: "ready",
        progress: 100,
        message: "Data loaded successfully!",
      });
    } catch (error) {
      this.updateState({
        status: "error",
        progress: 0,
        message: "Failed to store data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Update loading state and notify listeners
   */
  private updateState(state: Partial<DataLoadingState>) {
    this.loadingState = { ...this.loadingState, ...state };
    this.listeners.forEach((listener) => listener(this.loadingState));
  }

  /**
   * Subscribe to loading state changes
   */
  public onStateChange(callback: (state: DataLoadingState) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Get current loading state
   */
  public getState(): DataLoadingState {
    return { ...this.loadingState };
  }

  /**
   * Load data from JSON file URL
   */
  public async loadFromURL(url: string): Promise<void> {
    try {
      // Check if database has data first
      const { clearDatabase, isDatabasePopulated } = await import(
        "./indexedDB"
      );
      const hasData = await isDatabasePopulated();

      if (hasData) {
        this.updateState({
          status: "loading",
          progress: 0,
          message: "Clearing database cache...",
        });
        await clearDatabase();
      }

      this.updateState({
        status: "loading",
        progress: 5,
        message: "Fetching JSON file...",
      });

      // Fetch JSON file
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      this.updateState({
        status: "loading",
        progress: 5,
        message: "Downloading data...",
      });

      // Read response with progress tracking
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body not readable");
      }

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (total > 0) {
          const progress = (receivedLength / total) * 40; // 0-40% for download
          this.updateState({
            status: "loading",
            progress: 5 + progress,
            message: `Downloaded ${(receivedLength / 1024 / 1024).toFixed(
              1
            )}MB...`,
          });
        }
      }

      // Combine chunks
      const chunksAll = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
      }

      // Decode to string
      const text = new TextDecoder("utf-8").decode(chunksAll);

      this.updateState({
        status: "processing",
        progress: 50,
        message: "Processing data in background...",
      });

      // Send to worker for processing
      if (this.worker) {
        this.worker.postMessage({
          type: "PROCESS_JSON",
          payload: text,
        });
      } else {
        throw new Error("Worker not initialized");
      }
    } catch (error) {
      this.updateState({
        status: "error",
        progress: 0,
        message: "Failed to load data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Load data from File object (for user uploads)
   */
  public async loadFromFile(file: File): Promise<void> {
    try {
      // Check if database has data first
      const { clearDatabase, isDatabasePopulated } = await import(
        "./indexedDB"
      );
      const hasData = await isDatabasePopulated();

      if (hasData) {
        this.updateState({
          status: "loading",
          progress: 0,
          message: "Clearing database cache...",
        });
        await clearDatabase();

        // Verify it's actually empty
        const stillHasData = await isDatabasePopulated();
        if (stillHasData) {
          throw new Error("Failed to clear existing data");
        }
      }

      this.updateState({
        status: "loading",
        progress: 10,
        message: `Reading file: ${file.name}`,
      });

      const text = await file.text();

      this.updateState({
        status: "processing",
        progress: 50,
        message: "Processing vulnerability data...",
      });

      if (this.worker) {
        this.worker.postMessage({
          type: "PROCESS_JSON",
          payload: text,
        });
      } else {
        throw new Error("Worker not initialized");
      }
    } catch (error) {
      this.updateState({
        status: "error",
        progress: 0,
        message: "Failed to load file",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Check if data is already loaded in IndexedDB
   */
  public async isDataAvailable(): Promise<boolean> {
    return isDatabasePopulated();
  }

  /**
   * Get cached metrics without recomputation
   */
  public async getCachedMetrics(): Promise<VulnerabilityMetrics | null> {
    const metrics = await getCachedMetrics();
    return metrics || null;
  }

  /**
   * Cleanup resources
   */
  public destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.listeners.clear();
  }
}

// Singleton instance
let dataLoaderInstance: DataLoader | null = null;

/**
 * Get or create DataLoader singleton
 */
export function getDataLoader(): DataLoader {
  if (!dataLoaderInstance) {
    dataLoaderInstance = new DataLoader();
  }
  return dataLoaderInstance;
}
