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

    // 1. Calculate overall SHA-256 hash first for integrity check
    const fileHash = await calculateFileHashBrowser(fileObj);

    let bytesTransferred = 0;
    const startTime = Date.now();
    let lastSampleTime = Date.now();
    let lastSampleBytes = 0;
    let currentSpeed = 0; // Bytes per second

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      if (abortSignal && abortSignal.aborted) {
        throw new Error('Upload cancelled by user');
      }

      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, fileObj.size);
      const chunkBlob = fileObj.slice(start, end);
      const isLastChunk = chunkIndex === totalChunks - 1;

      const formData = new FormData();
      formData.append('chunk', chunkBlob, fileMeta.name);
      formData.append('fileId', fileMeta.id);
      formData.append('chunkIndex', chunkIndex);
      formData.append('totalChunks', totalChunks);
      formData.append('isLastChunk', isLastChunk);
      if (isLastChunk) {
        formData.append('hash', fileHash);
      }

      const response = await axios.post(chunkEndpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: abortSignal,
        timeout: 60000
      });

      if (!response.data.success) {
        throw new Error(response.data.error || `Failed to upload chunk ${chunkIndex}`);
      }

      const chunkSize = end - start;
      bytesTransferred += chunkSize;

      // Calculate transfer speed and ETA
      const now = Date.now();
      const timeDiff = (now - lastSampleTime) / 1000;
      if (timeDiff >= 0.5 || isLastChunk) {
        const bytesDiff = bytesTransferred - lastSampleBytes;
        currentSpeed = Math.round(bytesDiff / timeDiff);
        lastSampleTime = now;
        lastSampleBytes = bytesTransferred;
      }

      const totalElapsedTime = (now - startTime) / 1000;
      const averageSpeed = totalElapsedTime > 0 ? Math.round(bytesTransferred / totalElapsedTime) : currentSpeed;
      const bytesRemaining = fileObj.size - bytesTransferred;
      const etaSeconds = averageSpeed > 0 ? bytesRemaining / averageSpeed : 0;
      const percent = Math.min(100, Math.round((bytesTransferred / fileObj.size) * 100));

      if (onProgress) {
        onProgress({
          fileId: fileMeta.id,
          chunkIndex,
          totalChunks,
          bytesTransferred,
          totalBytes: fileObj.size,
          speed: currentSpeed || averageSpeed,
          etaSeconds,
          percent,
          isCompleted: isLastChunk
        });
      }
    }

    return {
      success: true,
      fileId: fileMeta.id,
      hash: fileHash
    };
  }
}
