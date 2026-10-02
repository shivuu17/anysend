import path from 'path';
import fs from 'fs';

/**
 * Sanitizes a filename to prevent path traversal and unsafe characters.
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return 'unnamed_file';
  }

  // Take only the basename, removing any directory paths
  let safeName = path.basename(filename);

  // Replace control characters and OS-reserved characters
  safeName = safeName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');

  // Prevent hidden system files starting with dot or space
  safeName = safeName.replace(/^[\.\s]+/, '');

  if (!safeName) {
    safeName = 'unnamed_file';
  }

  return safeName;
}

/**
 * Resolves a non-conflicting file path in targetDirectory.
 * If file.txt exists, returns file (1).txt, file (2).txt, etc.
 */
export function getUniqueFilePath(targetDirectory, originalFilename) {
  const sanitized = sanitizeFilename(originalFilename);
  const ext = path.extname(sanitized);
  const base = path.basename(sanitized, ext);

  let targetPath = path.join(targetDirectory, sanitized);
  let counter = 1;

  while (fs.existsSync(targetPath)) {
    targetPath = path.join(targetDirectory, `${base} (${counter})${ext}`);
    counter++;
  }

  return {
    filePath: targetPath,
    filename: path.basename(targetPath),
  };
}
