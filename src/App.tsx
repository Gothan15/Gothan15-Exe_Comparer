"use client";

import { useState } from "react";
import FileUploader from "@/components/file-uploader";
import ResultsViewer from "@/components/results-viewer";
import type { FileData } from "types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, FileDiff } from "lucide-react";

export default function Home() {
  const [files, setFiles] = useState<FileData[]>([]);

  // Handle file selection
  const handleFilesSelected = (newFiles: FileData[]) => {
    setFiles(newFiles);
  };

  // Handle clearing files
  const handleClearFiles = () => {
    setFiles([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 animate-fadeIn">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Herramienta de Comparación de Archivos Binarios
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto animate-fadeIn animation-delay-100">
              Suba dos archivos ejecutables para analizar y visualizar sus
              diferencias con tecnología avanzada de comparación binaria
            </p>
          </div>

          <Card className="animate-fadeIn animation-delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDiff className="w-5 h-5" />
                Subir Archivos para Comparación
              </CardTitle>
              <CardDescription>
                Seleccione dos archivos ejecutables para comparar su contenido y
                estructura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                onFilesSelected={handleFilesSelected}
                onClearFiles={handleClearFiles}
                files={files}
              />
            </CardContent>
          </Card>

          {files.length === 2 ? (
            <div className="animate-fadeIn">
              <ResultsViewer files={files} />
            </div>
          ) : (
            <Card className="bg-muted/50 border-dashed animate-fadeIn animation-delay-300">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">Listo para Análisis</h3>
                <p className="text-sm max-w-md">
                  Suba dos archivos ejecutables arriba para comenzar a comparar
                  su contenido, estructura y diferencias
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
