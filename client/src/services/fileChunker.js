import axios from 'axios';
import { getApiBaseUrl } from '../utils/network.js';
import { calculateFileHashBrowser } from './cryptoService.js';

const CHUNK_SIZE = 4 * 1024 * 1024; // 4 MB per chunk

export class FileChunker {
  /**
   * Uploads a file in 4MB chunks with streaming progress, speed tracking, and abort signal.
   */
  static async uploadFile({
    transferId,
    fileObj, // Raw browser File object
    fileMeta, // File metadata object from transfer session { id, name, size }
    targetHostUrl = null,
    isRelay = false,
    onProgress = null,
    abortSignal = null
  }) {
    const baseUrl = targetHostUrl ? `${targetHostUrl}/api` : `${getApiBaseUrl()}/api`;
    const isRelaySession = isRelay || /^\d{6}$/.test(String(transferId).trim());
    const chunkEndpoint = isRelaySession
      ? `${baseUrl}/relay/${transferId}/chunk`
      : `${baseUrl}/transfer/${transferId}/chunk`;

    const totalChunks = Math.ceil(fileObj.size / CHUNK_SIZE);

    // Calculate file hash asynchronously for large files so upload starts immediately
    const fileHashPromise = fileObj.size > 50 * 1024 * 1024
      ? calculateFileHashBrowser(fileObj)
      : null;
    let fileHash = fileObj.size <= 50 * 1024 * 1024
      ? await calculateFileHashBrowser(fileObj)
      : null;

    let bytesTransferred = 0;
    const startTime = Date.now();
    let lastSampleTime = Date.now();
    let lastSampleBytes = 0;
    let smoothedSpeed = 0; // Exponential moving average speed

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      if (abortSignal && abortSignal.aborted) {
        throw new Error('Upload cancelled by user');
      }

      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, fileObj.size);
      const chunkBlob = fileObj.slice(start, end);
      const isLastChunk = chunkIndex === totalChunks - 1;

      if (isLastChunk && fileHashPromise && !fileHash) {
        fileHash = await fileHashPromise;
      }

      const formData = new FormData();
      formData.append('chunk', chunkBlob, fileMeta.name);
      formData.append('fileId', fileMeta.id);
      formData.append('chunkIndex', chunkIndex);
      formData.append('totalChunks', totalChunks);
      formData.append('isLastChunk', isLastChunk);
      if (isLastChunk && fileHash) {
        formData.append('hash', fileHash);
      }

      // Chunk Upload with Automatic 3x Retry Loop
      let response = null;
      let retries = 3;

      while (retries > 0) {
        try {
          response = await axios.post(chunkEndpoint, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            signal: abortSignal,
            timeout: 120000 // 120s timeout per chunk
          });

          if (response.data && response.data.success) {
            break; // Chunk upload succeeded!
          } else {
            throw new Error(response.data?.error || `Chunk ${chunkIndex} failed`);
          }
        } catch (err) {
          retries--;
          if (abortSignal && abortSignal.aborted) {
            throw new Error('Upload cancelled by user');
          }
          if (retries === 0) {
            throw err;
          }
          // Wait 1s before retrying chunk
          await new Promise(res => setTimeout(res, 1000));
        }
      }

      const chunkSize = end - start;
      bytesTransferred += chunkSize;

      // Smooth Speed & ETA Calculation using Exponential Moving Average
      const now = Date.now();
      const timeDiff = (now - lastSampleTime) / 1000;
      if (timeDiff >= 0.3 || isLastChunk) {
        const bytesDiff = bytesTransferred - lastSampleBytes;
        const instantSpeed = Math.round(bytesDiff / timeDiff);
        smoothedSpeed = smoothedSpeed === 0 ? instantSpeed : Math.round(0.7 * smoothedSpeed + 0.3 * instantSpeed);
        lastSampleTime = now;
        lastSampleBytes = bytesTransferred;
      }

      const totalElapsedTime = (now - startTime) / 1000;
      const averageSpeed = totalElapsedTime > 0 ? Math.round(bytesTransferred / totalElapsedTime) : smoothedSpeed;
      const effectiveSpeed = smoothedSpeed || averageSpeed;
      const bytesRemaining = fileObj.size - bytesTransferred;
      const etaSeconds = effectiveSpeed > 0 ? bytesRemaining / effectiveSpeed : 0;
      const percent = Math.min(100, Math.round((bytesTransferred / fileObj.size) * 100));

      if (onProgress) {
        onProgress({
          fileId: fileMeta.id,
          chunkIndex,
          totalChunks,
          bytesTransferred,
          totalBytes: fileObj.size,
          speed: effectiveSpeed,
          etaSeconds,
          percent,
          isCompleted: isLastChunk
        });
      }
    }

    if (!fileHash && fileHashPromise) {
      fileHash = await fileHashPromise;
    }

    return {
      success: true,
      fileId: fileMeta.id,
      hash: fileHash
    };
  }
}
