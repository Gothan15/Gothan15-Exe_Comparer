"use client";

import { useEffect, useState } from "react";
import type { FileData, ComparisonResult } from "types";
import {
  calculateHash,
  compareSizes,
  findByteDifferences,
  formatFileSize,
  calculateSimilarity,
  getBytesAtPositions,
} from "@/utils/analyzer";
import { detectFileType, analyzeFileStructure } from "@/utils/file-analyzer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  FileDigit,
  BarChart3,
  List,
  Layers,
  PieChart,
  ClipboardList,
  Code,
} from "lucide-react";
import { HexDifferencesDialog } from "@/components/hex-differences-dialog";
import { FileStructureView } from "@/components/file-structure-view";
import { ArchitectureDiagram } from "@/components/architecture-diagram";

export default function ResultsViewer({ files }: { files: FileData[] }) {
  const [results, setResults] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (files.length === 2) {
      setLoading(true);

      // Simulate processing delay for better UX
      setTimeout(() => {
        const hash1 = calculateHash(files[0].content);
        const hash2 = calculateHash(files[1].content);
        const sizeMatch = compareSizes(files[0].content, files[1].content);
        const differences = findByteDifferences(
          files[0].content,
          files[1].content
        );
        const similarity = calculateSimilarity(
          files[0].content,
          files[1].content
        );
        // Get the actual byte values at difference positions
        const byteValues = getBytesAtPositions(
          files[0].content,
          files[1].content,
          differences
        );

        // Detect file types
        const file1Type = detectFileType(files[0].content);
        const file2Type = detectFileType(files[1].content);

        // Analyze file structure
        const file1Structure = analyzeFileStructure(
          files[0].content,
          file1Type.type
        );
        const file2Structure = analyzeFileStructure(
          files[1].content,
          file2Type.type
        );

        setResults({
          hash1,
          hash2,
          sizeMatch,
          differences,
          similarity,
          file1Name: files[0].name,
          file2Name: files[1].name,
          file1Size: files[0].content.byteLength,
          file2Size: files[1].content.byteLength,
          byteValues,
          file1Type,
          file2Type,
          file1Structure,
          file2Structure,
        });
        setLoading(false);
      }, 800);
    }
  }, [files]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="bg-gray-200 h-8 w-48 rounded"></CardTitle>
          <CardDescription className="bg-gray-200 h-4 w-72 rounded"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-200 h-6 w-full rounded"></div>
            <div className="bg-gray-200 h-6 w-3/4 rounded"></div>
            <div className="bg-gray-200 h-6 w-5/6 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) return null;

  const matchStatus =
    results.hash1 === results.hash2
      ? {
          label: "Idénticos",
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          color: "bg-green-100 text-green-800",
        }
      : results.similarity > 90
      ? {
          label: "Similares",
          icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
          color: "bg-amber-100 text-amber-800",
        }
      : {
          label: "Diferentes",
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          color: "bg-red-100 text-red-800",
        };

  return (
    <Card className="animate-fadeIn dark:bg-gray-800/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Resultados de la Comparación</CardTitle>
          <Badge className={matchStatus.color}>{matchStatus.label}</Badge>
        </div>
        <CardDescription>
          Análisis de diferencias entre los dos archivos ejecutables
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4 text-xs sm:text-sm">
            <TabsTrigger value="summary">
              <span className="flex items-center gap-1">
                <PieChart className="w-4 h-4" />
                <span className="hidden sm:inline">Resumen</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="details">
              <span className="flex items-center gap-1">
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Detalles</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="architecture">
              <span className="flex items-center gap-1">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Arquitectura</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="bytes">
              <span className="flex items-center gap-1">
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Análisis de Bytes</span>
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Similitud
                </h3>
                <div className="flex items-center gap-2">
                  <Progress value={results.similarity} className="h-3" />
                  <span className="text-sm font-medium">
                    {results.similarity}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="dark:bg-gray-800/60">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FileDigit className="w-4 h-4" />
                      Archivo 1: {results.file1Name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm">
                      Tamaño: {formatFileSize(results.file1Size)}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      Hash: {results.hash1}
                    </p>
                    {results.file1Type && (
                      <p className="text-sm mt-1">
                        Tipo:{" "}
                        <Badge variant="outline" className="bg-primary/10">
                          {results.file1Type.description}
                        </Badge>
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800/60">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FileDigit className="w-4 h-4" />
                      Archivo 2: {results.file2Name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm">
                      Tamaño: {formatFileSize(results.file2Size)}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      Hash: {results.hash2}
                    </p>
                    {results.file2Type && (
                      <p className="text-sm mt-1">
                        Tipo:{" "}
                        <Badge variant="outline" className="bg-primary/10">
                          {results.file2Type.description}
                        </Badge>
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted/50 dark:bg-gray-800/30">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-medium mb-1">
                      Coincidencia de Tamaño
                    </h3>
                    {results.sizeMatch ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 dark:bg-gray-800/30">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-medium mb-1">
                      Coincidencia de Hash
                    </h3>
                    {results.hash1 === results.hash2 ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 dark:bg-gray-800/30">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-medium mb-1">
                      Bytes Diferentes
                    </h3>
                    <p className="text-lg font-semibold">
                      {results.differences.length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Archivo 1</h3>
                  <p className="text-sm truncate">{results.file1Name}</p>
                  <p className="text-sm">
                    Tamaño: {formatFileSize(results.file1Size)}
                  </p>
                  <p className="text-sm font-mono  break-all mt-2">
                    Hash (tipo-MD5): {results.hash1}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Archivo 2</h3>
                  <p className="text-sm truncate">{results.file2Name}</p>
                  <p className="text-sm">
                    Tamaño: {formatFileSize(results.file2Size)}
                  </p>
                  <p className="text-sm font-mono  break-all mt-2">
                    Hash (tipo-MD5): {results.hash2}
                  </p>
                </div>
              </div>

              <Card className="dark:bg-gray-800/60">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Estadísticas de Comparación
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm flex items-center gap-1">
                        Coincidencia de tamaño:
                        {results.sizeMatch ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        Coincidencia de contenido:
                        {results.differences.length === 0 ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        Diferencias totales: {results.differences.length} bytes
                      </p>
                      <p className="text-sm">
                        Similitud: {results.similarity}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="architecture">
            <div className="space-y-4 py-2">
              {results.file1Type && results.file2Type && (
                <ArchitectureDiagram
                  file1Name={results.file1Name}
                  file2Name={results.file2Name}
                  file1Type={results.file1Type}
                  file2Type={results.file2Type}
                  file1Structure={results.file1Structure || {}}
                  file2Structure={results.file2Structure || {}}
                  file1Size={results.file1Size}
                  file2Size={results.file2Size}
                  similarity={results.similarity}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {results.file1Type && (
                  <FileStructureView
                    fileName={results.file1Name}
                    fileSize={results.file1Size}
                    fileType={results.file1Type}
                    fileStructure={results.file1Structure || {}}
                  />
                )}

                {results.file2Type && (
                  <FileStructureView
                    fileName={results.file2Name}
                    fileSize={results.file2Size}
                    fileType={results.file2Type}
                    fileStructure={results.file2Structure || {}}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bytes">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Vista Previa de Diferencias de Bytes
                </h3>
                {results.differences.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <List className="w-3 h-3" />
                    {results.differences.length} diferencias
                  </Badge>
                )}
              </div>

              {results.differences.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No se encontraron diferencias.
                </p>
              ) : (
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    {results.differences.slice(0, 100).map((pos) => (
                      <Badge
                        key={pos}
                        variant="outline"
                        className="text-xs justify-center font-mono"
                      >
                        {pos.toString(16).padStart(8, "0")}
                      </Badge>
                    ))}
                    {results.differences.length > 100 && (
                      <span className="text-xs text-muted-foreground col-span-full text-center mt-2">
                        + {results.differences.length - 100} más diferencias
                      </span>
                    )}
                  </div>
                </div>
              )}

              {results.differences.length > 0 && (
                <div className="flex justify-center">
                  <HexDifferencesDialog
                    differences={results.differences}
                    file1Size={results.file1Size}
                    file2Size={results.file2Size}
                    file1Name={results.file1Name}
                    file2Name={results.file2Name}
                    byteValues={results.byteValues || []}
                  />
                </div>
              )}

              <div className="rounded-md border p-4 bg-muted/30">
                <h3 className="text-sm font-medium mb-2">Visualización</h3>
                <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                  {results.differences.length > 0 && (
                    <div className="flex w-full h-full">
                      {Array.from({ length: 50 }).map((_, idx) => {
                        const rangeStart = Math.floor(
                          (idx / 50) * results.file1Size
                        );
                        const rangeEnd = Math.floor(
                          ((idx + 1) / 50) * results.file1Size
                        );

                        // Check if any differences exist in this range
                        const hasDiffInRange = results.differences.some(
                          (d) => d >= rangeStart && d < rangeEnd
                        );

                        return (
                          <div
                            key={idx}
                            className={`h-full flex-1 ${
                              hasDiffInRange ? "bg-red-500" : "bg-green-500"
                            }`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs">0</span>
                  <span className="text-xs">Posición del Archivo</span>
                  <span className="text-xs">
                    {formatFileSize(results.file1Size)}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
