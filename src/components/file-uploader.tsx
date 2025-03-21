"use client";

import type React from "react";

import { useState, useEffect } from "react";
import type { FileData } from "types";
import { Upload, FileIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatFileSize } from "@/utils/analyzer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FileUploaderProps {
  onFilesSelected: (files: FileData[]) => void;
  onClearFiles: () => void;
  files: FileData[];
}

export default function FileUploader({
  onFilesSelected,
  onClearFiles,
  files,
}: FileUploaderProps) {
  const [fileDetails, setFileDetails] = useState<
    { name: string; size: number }[]
  >([null, null]);
  const [loading, setLoading] = useState<boolean[]>([false, false]);

  // Reset file details when files are cleared
  useEffect(() => {
    if (files.length === 0) {
      setFileDetails([null, null]);
    }
  }, [files]);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Update loading state
    const newLoading = [...loading];
    newLoading[index] = true;
    setLoading(newLoading);

    // Update file details immediately for UI feedback
    const newFileDetails = [...fileDetails];
    newFileDetails[index] = { name: file.name, size: file.size };
    setFileDetails(newFileDetails);

    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as ArrayBuffer;
      const newFiles = [...files];
      newFiles[index] = { name: file.name, content };

      // Update loading state
      const updatedLoading = [...loading];
      updatedLoading[index] = false;
      setLoading(updatedLoading);

      // Notify parent
      onFilesSelected(newFiles);
    };

    reader.readAsArrayBuffer(file);
  };

  const triggerFileInput = (index: number) => {
    const fileInput = document.getElementById(
      `file-input-${index}`
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleClearFiles = () => {
    // Reset file inputs
    const fileInputs = document.querySelectorAll(
      'input[type="file"]'
    ) as NodeListOf<HTMLInputElement>;
    fileInputs.forEach((input) => {
      input.value = "";
    });

    // Clear state
    setFileDetails([null, null]);
    onClearFiles();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {[0, 1].map((index) => (
          <Card
            key={index}
            className="overflow-hidden transition-all hover:shadow-md dark:bg-gray-800/50"
          >
            <CardContent className="p-0">
              <div
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => triggerFileInput(index)}
              >
                <input
                  id={`file-input-${index}`}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, index)}
                  accept=".exe,.dll,.bin,.dat"
                />

                {fileDetails[index] ? (
                  <div className="flex flex-col items-center gap-2 text-center animate-fadeIn">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm truncate max-w-[200px]">
                        {fileDetails[index].name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(fileDetails[index].size)}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      Cambiar Archivo
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4 animate-fadeIn">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">
                      {loading[index]
                        ? "Procesando..."
                        : `Subir archivo ${index + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground text-center max-w-[220px]">
                      Selecciona o arrastra y suelta el archivo ejecutable
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Seleccionar Archivo
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clear Files Button */}
      {files.length > 0 && (
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Eliminar Archivos
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar archivos subidos?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esto eliminará todos los archivos subidos actualmente y los
                  resultados del análisis. Necesitarás subir nuevos archivos
                  para continuar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearFiles}>
                  Eliminar Archivos
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
