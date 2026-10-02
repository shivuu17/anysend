import { sha256 } from 'js-sha256';

/**
 * Computes SHA-256 hash of a browser File object incrementally using FileReader streams.
 * Avoids loading multi-gigabyte files into RAM.
 */
export function calculateFileHashBrowser(file, onProgress = null) {
  return new Promise((resolve, reject) => {
    const chunkSize = 4 * 1024 * 1024; // 4 MB chunk
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;

    const hasher = sha256.create();
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = new Uint8Array(e.target.result);
        hasher.update(buffer);

        currentChunk++;

        if (onProgress) {
          onProgress(Math.round((currentChunk / chunks) * 100));
        }

        if (currentChunk < chunks) {
          loadNextChunk();
        } else {
          resolve(hasher.hex());
        }
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => {
      reject(err);
    };

    function loadNextChunk() {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const blob = file.slice(start, end);
      reader.readAsArrayBuffer(blob);
    }

    loadNextChunk();
  });
}
