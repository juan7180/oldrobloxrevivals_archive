export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureMediaDownload } = await import("./server/media/startup");
    void ensureMediaDownload();
  }
}
