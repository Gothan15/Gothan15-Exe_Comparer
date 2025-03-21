// Utility functions for file analysis and comparison

/**
 * Calculate a hash for the provided file content
 */
export function calculateHash(content: ArrayBuffer): string {
  // In a real application, you would use a proper hash function
  // This is a simplified implementation for demonstration purposes
  const view = new Uint8Array(content);
  let hash = 0;

  for (let i = 0; i < view.length; i++) {
    hash = (hash << 5) - hash + view[i];
    hash |= 0; // Convert to 32bit integer
  }

  // Convert to hexadecimal string
  return Math.abs(hash).toString(16).padStart(8, "0");
}

/**
 * Compare sizes of two files
 */
export function compareSizes(
  content1: ArrayBuffer,
  content2: ArrayBuffer
): boolean {
  return content1.byteLength === content2.byteLength;
}

/**
 * Find byte-level differences between two files
 */
export function findByteDifferences(
  content1: ArrayBuffer,
  content2: ArrayBuffer
): number[] {
  const view1 = new Uint8Array(content1);
  const view2 = new Uint8Array(content2);
  const differences: number[] = [];

  const minLength = Math.min(view1.length, view2.length);

  for (let i = 0; i < minLength; i++) {
    if (view1[i] !== view2[i]) {
      differences.push(i);
    }
  }

  // If files have different lengths, consider all additional bytes as differences
  if (view1.length !== view2.length) {
    const maxLength = Math.max(view1.length, view2.length);
    for (let i = minLength; i < maxLength; i++) {
      differences.push(i);
    }
  }

  return differences;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}

/**
 * Calculate the percentage of similarity between two files
 */
export function calculateSimilarity(
  content1: ArrayBuffer,
  content2: ArrayBuffer
): number {
  const totalBytes = Math.max(content1.byteLength, content2.byteLength);
  const differences = findByteDifferences(content1, content2).length;

  if (totalBytes === 0) return 100;

  const similarity = ((totalBytes - differences) / totalBytes) * 100;
  return Math.round(similarity * 100) / 100; // Round to 2 decimal places
}

// Add a new function to get byte values at specific positions
/**
 * Get byte values at specific positions from two files
 */
export function getBytesAtPositions(
  content1: ArrayBuffer,
  content2: ArrayBuffer,
  positions: number[]
): Array<{
  position: number;
  byte1: number;
  byte2: number;
  char1: string;
  char2: string;
}> {
  const view1 = new Uint8Array(content1);
  const view2 = new Uint8Array(content2);

  return positions.map((position) => {
    const byte1 = position < view1.length ? view1[position] : 0;
    const byte2 = position < view2.length ? view2[position] : 0;

    // Convert to printable character or dot for non-printable
    const char1 = byte1 !== 0 ? byteToChar(byte1) : "";
    const char2 = byte2 !== 0 ? byteToChar(byte2) : "";

    return {
      position,
      byte1,
      byte2,
      char1,
      char2,
    };
  });
}

/**
 * Convert a byte to a printable character
 */
export function byteToChar(byte: number): string {
  // Check if it's a printable ASCII character (32-126)
  if (byte >= 32 && byte <= 126) {
    return String.fromCharCode(byte);
  }
  // Return a dot for non-printable characters
  return ".";
}
