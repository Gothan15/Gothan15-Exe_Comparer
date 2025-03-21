/**
 * Utility functions for analyzing file types and architecture
 */

// Common file signatures (magic numbers) for identification
const FILE_SIGNATURES = {
  // Executable formats
  MZ: [0x4d, 0x5a], // DOS MZ executable
  ELF: [0x7f, 0x45, 0x4c, 0x46], // ELF format (Linux)
  MACHO32: [0xfe, 0xed, 0xfa, 0xce], // Mach-O 32-bit
  MACHO64: [0xfe, 0xed, 0xfa, 0xcf], // Mach-O 64-bit
  // Document formats
  PDF: [0x25, 0x50, 0x44, 0x46], // PDF
  ZIP: [0x50, 0x4b, 0x03, 0x04], // ZIP (also used by DOCX, XLSX, PPTX, JAR, APK)
  // Image formats
  JPEG: [0xff, 0xd8, 0xff], // JPEG
  PNG: [0x89, 0x50, 0x4e, 0x47], // PNG
  GIF: [0x47, 0x49, 0x46, 0x38], // GIF
  // Other formats
  CLASS: [0xca, 0xfe, 0xba, 0xbe], // Java class file
}

/**
 * Detect file type based on content
 */
export function detectFileType(content: ArrayBuffer): {
  type: string
  subtype?: string
  architecture?: string
  description: string
} {
  const view = new Uint8Array(content)

  // Check for MZ header (DOS/Windows executables)
  if (matchSignature(view, FILE_SIGNATURES.MZ)) {
    // Check for PE header
    const peHeaderOffset = readDwordLE(view, 0x3c)
    if (peHeaderOffset < view.length - 4 && view[peHeaderOffset] === 0x50 && view[peHeaderOffset + 1] === 0x45) {
      // It's a PE file (Windows executable)
      const machineType = readWordLE(view, peHeaderOffset + 4)
      const characteristics = readWordLE(view, peHeaderOffset + 22)
      const optionalHeaderMagic = readWordLE(view, peHeaderOffset + 24)

      let architecture = "Unknown"
      let subtype = "Unknown"

      // Determine architecture
      switch (machineType) {
        case 0x014c:
          architecture = "x86 (32-bit)"
          break
        case 0x0200:
          architecture = "IA64 (Itanium)"
          break
        case 0x8664:
          architecture = "x64 (64-bit)"
          break
        case 0x01c4:
          architecture = "ARM"
          break
        case 0xaa64:
          architecture = "ARM64"
          break
      }

      // Determine subtype
      if ((characteristics & 0x2000) !== 0) {
        subtype = "DLL"
      } else if ((characteristics & 0x0002) !== 0) {
        subtype = "EXE"
      } else if ((characteristics & 0x1000) !== 0) {
        subtype = "SYS"
      }

      return {
        type: "Windows Executable",
        subtype,
        architecture,
        description: `Windows ${subtype} (${architecture})`,
      }
    }
    return {
      type: "DOS Executable",
      description: "MS-DOS executable file",
    }
  }

  // Check for ELF (Linux executables)
  if (matchSignature(view, FILE_SIGNATURES.ELF)) {
    const elfClass = view[4] // 1 for 32-bit, 2 for 64-bit
    const elfData = view[5] // 1 for little endian, 2 for big endian
    const elfType = readWordLE(view, 16)

    const architecture = elfClass === 1 ? "32-bit" : "64-bit"
    let subtype = "Unknown"

    // Determine subtype
    switch (elfType) {
      case 1:
        subtype = "REL"
        break // Relocatable file
      case 2:
        subtype = "EXEC"
        break // Executable file
      case 3:
        subtype = "DYN"
        break // Shared object
      case 4:
        subtype = "CORE"
        break // Core dump
    }

    return {
      type: "ELF",
      subtype,
      architecture,
      description: `Linux/Unix ${subtype} (${architecture})`,
    }
  }

  // Check for Mach-O (macOS executables)
  if (matchSignature(view, FILE_SIGNATURES.MACHO32)) {
    return {
      type: "Mach-O",
      architecture: "32-bit",
      description: "macOS/iOS executable (32-bit)",
    }
  }

  if (matchSignature(view, FILE_SIGNATURES.MACHO64)) {
    return {
      type: "Mach-O",
      architecture: "64-bit",
      description: "macOS/iOS executable (64-bit)",
    }
  }

  // Check for ZIP-based formats
  if (matchSignature(view, FILE_SIGNATURES.ZIP)) {
    // Try to determine if it's a specific ZIP-based format
    if (containsFile(view, "word/document.xml")) {
      return {
        type: "DOCX",
        description: "Microsoft Word Document",
      }
    } else if (containsFile(view, "xl/workbook.xml")) {
      return {
        type: "XLSX",
        description: "Microsoft Excel Spreadsheet",
      }
    } else if (containsFile(view, "ppt/presentation.xml")) {
      return {
        type: "PPTX",
        description: "Microsoft PowerPoint Presentation",
      }
    } else if (containsFile(view, "META-INF/MANIFEST.MF")) {
      return {
        type: "JAR",
        description: "Java Archive",
      }
    } else if (containsFile(view, "AndroidManifest.xml")) {
      return {
        type: "APK",
        description: "Android Package",
      }
    }

    return {
      type: "ZIP",
      description: "ZIP Archive",
    }
  }

  // Check for PDF
  if (matchSignature(view, FILE_SIGNATURES.PDF)) {
    return {
      type: "PDF",
      description: "Portable Document Format",
    }
  }

  // Check for image formats
  if (matchSignature(view, FILE_SIGNATURES.JPEG)) {
    return {
      type: "JPEG",
      description: "JPEG Image",
    }
  }

  if (matchSignature(view, FILE_SIGNATURES.PNG)) {
    return {
      type: "PNG",
      description: "PNG Image",
    }
  }

  if (matchSignature(view, FILE_SIGNATURES.GIF)) {
    return {
      type: "GIF",
      description: "GIF Image",
    }
  }

  // Check for Java class file
  if (matchSignature(view, FILE_SIGNATURES.CLASS)) {
    return {
      type: "CLASS",
      description: "Java Class File",
    }
  }

  // If no specific format is detected, try to determine based on content patterns
  if (isProbablyText(view)) {
    if (containsPattern(view, "<?xml")) {
      return {
        type: "XML",
        description: "XML Document",
      }
    }

    if (containsPattern(view, "<!DOCTYPE html") || containsPattern(view, "<html")) {
      return {
        type: "HTML",
        description: "HTML Document",
      }
    }

    if (containsPattern(view, "#!/")) {
      return {
        type: "Script",
        description: "Shell Script",
      }
    }

    return {
      type: "Text",
      description: "Text File",
    }
  }

  // Default to binary if no specific format is detected
  return {
    type: "Binary",
    description: "Binary Data",
  }
}

/**
 * Analyze file structure to extract architectural information
 */
export function analyzeFileStructure(
  content: ArrayBuffer,
  fileType: string,
): {
  sections?: { name: string; size: number; description: string }[]
  headers?: { name: string; value: string }[]
  architecture?: string
  entryPoint?: string
  imports?: string[]
} {
  const view = new Uint8Array(content)

  // Handle PE files (Windows executables)
  if (fileType === "Windows Executable" && matchSignature(view, FILE_SIGNATURES.MZ)) {
    const peHeaderOffset = readDwordLE(view, 0x3c)
    if (peHeaderOffset < view.length - 4 && view[peHeaderOffset] === 0x50 && view[peHeaderOffset + 1] === 0x45) {
      const numberOfSections = readWordLE(view, peHeaderOffset + 6)
      const sizeOfOptionalHeader = readWordLE(view, peHeaderOffset + 20)
      const characteristics = readWordLE(view, peHeaderOffset + 22)
      const optionalHeaderMagic = readWordLE(view, peHeaderOffset + 24)

      // Determine if it's PE32 or PE32+
      const isPE32Plus = optionalHeaderMagic === 0x20b
      const architecture = isPE32Plus ? "64-bit" : "32-bit"

      // Get entry point
      const entryPoint =
        "0x" +
        readDwordLE(view, peHeaderOffset + 40)
          .toString(16)
          .toUpperCase()

      // Extract section information
      const sectionHeadersOffset = peHeaderOffset + 24 + sizeOfOptionalHeader
      const sections = []

      for (let i = 0; i < numberOfSections && i < 20; i++) {
        // Limit to 20 sections for safety
        const sectionOffset = sectionHeadersOffset + i * 40
        if (sectionOffset + 40 > view.length) break

        const nameBytes = view.slice(sectionOffset, sectionOffset + 8)
        let name = ""
        for (let j = 0; j < 8 && nameBytes[j] !== 0; j++) {
          name += String.fromCharCode(nameBytes[j])
        }

        const virtualSize = readDwordLE(view, sectionOffset + 8)
        const virtualAddress = readDwordLE(view, sectionOffset + 12)
        const sizeOfRawData = readDwordLE(view, sectionOffset + 16)
        const characteristics = readDwordLE(view, sectionOffset + 36)

        let description = ""
        if ((characteristics & 0x20) !== 0) description = "Code"
        else if ((characteristics & 0x40) !== 0) description = "Initialized Data"
        else if ((characteristics & 0x80) !== 0) description = "Uninitialized Data"
        else if ((characteristics & 0x200) !== 0) description = "Comments/Info"

        sections.push({
          name,
          size: sizeOfRawData,
          description,
        })
      }

      return {
        sections,
        architecture,
        entryPoint,
      }
    }
  }

  // Handle ELF files (Linux executables)
  if (fileType === "ELF" && matchSignature(view, FILE_SIGNATURES.ELF)) {
    const elfClass = view[4] // 1 for 32-bit, 2 for 64-bit
    const architecture = elfClass === 1 ? "32-bit" : "64-bit"

    // Basic ELF header information
    const headers = [
      { name: "Type", value: getElfTypeString(readWordLE(view, 16)) },
      { name: "Machine", value: getElfMachineString(readWordLE(view, 18)) },
      { name: "Version", value: readDwordLE(view, 20).toString() },
    ]

    return {
      headers,
      architecture,
    }
  }

  // For other file types, return minimal information
  return {}
}

// Helper functions

function matchSignature(data: Uint8Array, signature: number[]): boolean {
  if (data.length < signature.length) return false

  for (let i = 0; i < signature.length; i++) {
    if (data[i] !== signature[i]) return false
  }

  return true
}

function readWordLE(data: Uint8Array, offset: number): number {
  if (offset + 1 >= data.length) return 0
  return data[offset] | (data[offset + 1] << 8)
}

function readDwordLE(data: Uint8Array, offset: number): number {
  if (offset + 3 >= data.length) return 0
  return data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24)
}

function isProbablyText(data: Uint8Array): boolean {
  // Check a sample of the file to see if it's likely text
  const sampleSize = Math.min(data.length, 1024)
  let textChars = 0

  for (let i = 0; i < sampleSize; i++) {
    // Count ASCII printable characters and common whitespace
    if ((data[i] >= 32 && data[i] <= 126) || data[i] === 9 || data[i] === 10 || data[i] === 13) {
      textChars++
    }
  }

  // If more than 90% of the sample is text characters, it's probably a text file
  return textChars / sampleSize > 0.9
}

function containsPattern(data: Uint8Array, pattern: string): boolean {
  const patternBytes = new TextEncoder().encode(pattern)

  // Simple substring search
  outer: for (let i = 0; i <= data.length - patternBytes.length; i++) {
    for (let j = 0; j < patternBytes.length; j++) {
      if (data[i + j] !== patternBytes[j]) continue outer
    }
    return true
  }

  return false
}

function containsFile(data: Uint8Array, filename: string): boolean {
  // This is a simplified check that looks for the filename in the ZIP central directory
  // A real implementation would properly parse the ZIP structure
  const filenameBytes = new TextEncoder().encode(filename)

  // Look for the filename in the data
  outer: for (let i = 0; i <= data.length - filenameBytes.length; i++) {
    for (let j = 0; j < filenameBytes.length; j++) {
      if (data[i + j] !== filenameBytes[j]) continue outer
    }
    return true
  }

  return false
}

function getElfTypeString(type: number): string {
  switch (type) {
    case 1:
      return "Relocatable"
    case 2:
      return "Executable"
    case 3:
      return "Shared Object"
    case 4:
      return "Core Dump"
    default:
      return "Unknown"
  }
}

function getElfMachineString(machine: number): string {
  switch (machine) {
    case 3:
      return "x86"
    case 62:
      return "x86-64"
    case 40:
      return "ARM"
    case 183:
      return "ARM64"
    default:
      return `Unknown (${machine})`
  }
}

