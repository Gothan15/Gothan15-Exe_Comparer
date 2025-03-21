import type { FileTypeInfo, FileStructureInfo } from "types";
import { Card, CardContent } from "@/components/ui/card";
import { formatFileSize } from "@/utils/analyzer";

interface ArchitectureDiagramProps {
  file1Name: string;
  file2Name: string;
  file1Type: FileTypeInfo;
  file2Type: FileTypeInfo;
  file1Structure: FileStructureInfo;
  file2Structure: FileStructureInfo;
  file1Size: number;
  file2Size: number;
  similarity: number;
}

export function ArchitectureDiagram({
  file1Name,
  file2Name,
  file1Type,
  file2Type,
  file1Structure,
  file2Structure,
  file1Size,
  file2Size,
  similarity,
}: ArchitectureDiagramProps) {
  // Determine if the files have the same architecture
  const sameArchitecture =
    file1Type.type === file2Type.type &&
    file1Type.subtype === file2Type.subtype &&
    file1Type.architecture === file2Type.architecture;

  // Get section colors based on whether they exist in both files
  const getSectionColor = (sectionName: string, isFile1: boolean) => {
    const otherSections = isFile1
      ? file2Structure.sections || []
      : file1Structure.sections || [];

    const sectionExists = otherSections.some((s) => s.name === sectionName);

    if (sectionExists) {
      return "bg-green-500 dark:bg-green-600";
    } else {
      return isFile1
        ? "bg-blue-500 dark:bg-blue-600"
        : "bg-amber-500 dark:bg-amber-600";
    }
  };

  return (
    <Card className="dark:bg-gray-800/60">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="text-sm font-medium">Comparación de Arquitectura</div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            {/* File Type Comparison */}
            <div className="flex-1 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                Tipo de Archivo
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-blue-500`}></div>
                <div className="text-xs">
                  {file1Type.type}{" "}
                  {file1Type.subtype ? `(${file1Type.subtype})` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-amber-500`}></div>
                <div className="text-xs">
                  {file2Type.type}{" "}
                  {file2Type.subtype ? `(${file2Type.subtype})` : ""}
                </div>
              </div>
              {sameArchitecture ? (
                <div className="text-xs text-green-500 dark:text-green-400 font-medium mt-1">
                  Mismo tipo de archivo y arquitectura
                </div>
              ) : (
                <div className="text-xs text-amber-500 dark:text-amber-400 font-medium mt-1">
                  Tipo de archivo o arquitectura diferente
                </div>
              )}
            </div>

            {/* Architecture Comparison */}
            <div className="flex-1 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                Arquitectura
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-blue-500`}></div>
                <div className="text-xs">
                  {file1Type.architecture || "Desconocida"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-amber-500`}></div>
                <div className="text-xs">
                  {file2Type.architecture || "Desconocida"}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Tamaño: {formatFileSize(file1Size)} vs{" "}
                {formatFileSize(file2Size)}
              </div>
            </div>
          </div>

          {/* Section Visualization */}
          {(file1Structure.sections || file2Structure.sections) && (
            <div className="space-y-2 mt-2">
              <div className="text-xs font-medium text-muted-foreground">
                Comparación de Secciones
              </div>

              <div className="flex flex-col gap-2">
                {/* File 1 Sections */}
                {file1Structure.sections &&
                  file1Structure.sections.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full bg-blue-500`}
                        ></div>
                        <div>{file1Name} Secciones</div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {file1Structure.sections.map((section, index) => (
                          <div
                            key={index}
                            className={`px-2 py-1 rounded text-xs text-white ${getSectionColor(
                              section.name,
                              true
                            )}`}
                            style={{
                              minWidth: "60px",
                              textAlign: "center",
                              width: `${Math.max(
                                5,
                                Math.min(30, (section.size / file1Size) * 100)
                              )}%`,
                            }}
                            title={`${section.name}: ${formatFileSize(
                              section.size
                            )} - ${section.description}`}
                          >
                            {section.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* File 2 Sections */}
                {file2Structure.sections &&
                  file2Structure.sections.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full bg-amber-500`}
                        ></div>
                        <div>{file2Name} Secciones</div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {file2Structure.sections.map((section, index) => (
                          <div
                            key={index}
                            className={`px-2 py-1 rounded text-xs text-white ${getSectionColor(
                              section.name,
                              false
                            )}`}
                            style={{
                              minWidth: "60px",
                              textAlign: "center",
                              width: `${Math.max(
                                5,
                                Math.min(30, (section.size / file2Size) * 100)
                              )}%`,
                            }}
                            title={`${section.name}: ${formatFileSize(
                              section.size
                            )} - ${section.description}`}
                          >
                            {section.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="text-xs mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>Secciones presentes en ambos archivos</div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>Secciones únicas en {file1Name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div>Secciones únicas en {file2Name}</div>
                </div>
              </div>
            </div>
          )}

          {/* Similarity Indicator */}
          <div className="text-xs text-center mt-2">
            <div className="font-medium">
              Similitud Estructural General: {similarity}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
