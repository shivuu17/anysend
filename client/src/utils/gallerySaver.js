/**
 * Utility function to save received files (photos, videos, media) directly into native
 * iPhone/Android Photo Gallery using Web Share API or Blob object URLs.
 */
export async function saveToGallery(downloadUrl, fileName, mimeType = '') {
  try {
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const type = mimeType || blob.type || getMimeTypeFromExtension(fileName);
    const file = new File([blob], fileName, { type });

    // Check if Web Share API with file sharing is supported (iOS Safari / Android Chrome)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: fileName,
        text: `Save ${fileName} to Photos Gallery`
      });
      return { success: true, method: 'native_share' };
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, cancelled: true };
    }
    console.warn('Native share failed or declined, falling back to Blob download:', err);
  }

  // Fallback: Direct Blob Object URL Download
  try {
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);

    return { success: true, method: 'blob_download' };
  } catch (err) {
    console.error('Blob download failed, opening direct URL:', err);
    window.open(downloadUrl, '_blank');
    return { success: true, method: 'direct_link' };
  }
}

function getMimeTypeFromExtension(fileName = '') {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'webm':
      return 'video/webm';
    case 'mp3':
      return 'audio/mpeg';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}
