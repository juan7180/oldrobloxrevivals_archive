import { loadArchive } from "../archive";
import {
  downloadStatus,
  runMediaDownload,
  shouldAutoDownload,
} from "./download";

let started = false;

export async function ensureMediaDownload(): Promise<void> {
  if (!shouldAutoDownload() || started) return;
  started = true;

  try {
    const archive = await loadArchive();
    void runMediaDownload(archive.posts).catch((err) => {
      downloadStatus.running = false;
      downloadStatus.error =
        err instanceof Error ? err.message : "Media download failed";
      console.error("[media] Download failed:", err);
    });
  } catch (err) {
    started = false;
    console.error("[media] Could not load archive for media download:", err);
  }
}

export function getMediaDownloadStatus() {
  return { ...downloadStatus };
}
