export interface ManifestEntry {
  file: string;
  local: string;
  refs: string[];
}

export type MediaManifest = Record<string, ManifestEntry>;

export interface MediaDownloadStatus {
  running: boolean;
  complete: boolean;
  total: number;
  downloaded: number;
  skipped: number;
  failed: number;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
}
