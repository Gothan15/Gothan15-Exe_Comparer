export interface FileData {
  name: string;
  content: ArrayBuffer;
}

export interface FileTypeInfo {
  type: string;
  subtype?: string;
  architecture?: string;
  description: string;
}

export interface FileStructureInfo {
  sections?: { name: string; size: number; description: string }[];
  headers?: { name: string; value: string }[];
  architecture?: string;
  entryPoint?: string;
  imports?: string[];
}

export interface ComparisonResult {
  hash1: string;
  hash2: string;
  sizeMatch: boolean;
  differences: number[];
  similarity: number;
  file1Name: string;
  file2Name: string;
  file1Size: number;
  file2Size: number;
  byteValues?: ByteDifference[];
  file1Type?: FileTypeInfo;
  file2Type?: FileTypeInfo;
  file1Structure?: FileStructureInfo;
  file2Structure?: FileStructureInfo;
}

export interface ByteDifference {
  position: number;
  byte1: number | null;
  byte2: number | null;
  char1: string;
  char2: string;
}
