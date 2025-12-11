import fs from 'fs';
import path from 'path';

/**
 * Starts a periodic cleanup that deletes files older than maxFileAgeMs in tempDir.
 * Returns the interval id so callers can clear it if needed.
 */
export function startTempCleanup(tempDir, {
  maxFileAgeMs = 60 * 60 * 1000, // 1 hour
  cleanupIntervalMs = 10 * 60 * 1000 // 10 minutes
} = {}) {
  const cleanupTempFiles = () => {
    fs.readdir(tempDir, (err, files) => {
      if (err) {
        console.error('Temp cleanup error (read dir):', err.message);
        return;
      }
      const now = Date.now();
      files.forEach((file) => {
        const filePath = path.join(tempDir, file);
        fs.stat(filePath, (statErr, stats) => {
          if (statErr) {
            console.error('Temp cleanup error (stat):', statErr.message);
            return;
          }
          if (now - stats.mtimeMs > maxFileAgeMs) {
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Temp cleanup error (unlink):', unlinkErr.message);
              }
            });
          }
        });
      });
    });
  };

  // run once immediately
  cleanupTempFiles();
  // schedule periodic cleanup
  const intervalId = setInterval(cleanupTempFiles, cleanupIntervalMs);
  return intervalId;
}
