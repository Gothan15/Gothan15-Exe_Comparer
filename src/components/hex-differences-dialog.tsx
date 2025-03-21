"use client";

import type React from "react";

import { useState } from "react";
import {
  Search,
  Download,
  Copy,
  FileText,
  FileDigit,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ByteDifference } from "types";

interface HexDifferencesDialogProps {
  differences: number[];
  file1Size: number;
  file2Size: number;
  file1Name: string;
  file2Name: string;
  byteValues: ByteDifference[];
}

export function HexDifferencesDialog({
  differences,
  file1Size,
  file2Size,
  file1Name,
  file2Name,
  byteValues,
}: HexDifferencesDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Filter differences based on search term
  const filteredByteValues = searchTerm
    ? byteValues.filter(
        (diff) =>
          diff.position
            .toString(16)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          diff.position.toString().includes(searchTerm) ||
          (diff.char1 &&
            diff.char1.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (diff.char2 &&
            diff.char2.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (diff.byte1 !== null &&
            diff.byte1
              .toString(16)
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (diff.byte2 !== null &&
            diff.byte2
              .toString(16)
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      )
    : byteValues;

  // Calculate total pages
  const totalPages = Math.ceil(filteredByteValues.length / itemsPerPage);

  // Get current page items
  const currentItems = filteredByteValues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Copy to clipboard
  const copyToClipboard = (format: "hex" | "text" | "table") => {
    let text = "";

    if (format === "hex") {
      text = differences
        .map((pos) => pos.toString(16).padStart(8, "0"))
        .join(", ");
    } else if (format === "text") {
      text = byteValues
        .map((diff) => {
          return (
            `Posición: 0x${diff.position.toString(16).padStart(8, "0")}\n` +
            `Archivo 1 (${file1Name}): ${
              diff.byte1 !== null
                ? "0x" + diff.byte1.toString(16).padStart(2, "0")
                : "N/A"
            } (${diff.char1 || "N/A"})\n` +
            `Archivo 2 (${file2Name}): ${
              diff.byte2 !== null
                ? "0x" + diff.byte2.toString(16).padStart(2, "0")
                : "N/A"
            } (${diff.char2 || "N/A"})\n`
          );
        })
        .join("\n");
    } else if (format === "table") {
      text =
        `Posición,Archivo 1 (${file1Name}) Hex,Archivo 1 Texto,Archivo 2 (${file2Name}) Hex,Archivo 2 Texto\n` +
        byteValues
          .map((diff) => {
            return (
              `0x${diff.position.toString(16).padStart(8, "0")},` +
              `${
                diff.byte1 !== null
                  ? "0x" + diff.byte1.toString(16).padStart(2, "0")
                  : "N/A"
              },` +
              `${diff.char1 || "N/A"},` +
              `${
                diff.byte2 !== null
                  ? "0x" + diff.byte2.toString(16).padStart(2, "0")
                  : "N/A"
              },` +
              `${diff.char2 || "N/A"}`
            );
          })
          .join("\n");
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("¡Copiado al portapapeles!");
      })
      .catch((err) => {
        console.error("Error al copiar: ", err);
      });
  };

  // Download as CSV
  const downloadCSV = () => {
    const csvContent =
      `Posición,Archivo 1 (${file1Name}) Hex,Archivo 1 Texto,Archivo 2 (${file2Name}) Hex,Archivo 2 Texto\n` +
      byteValues
        .map((diff) => {
          return (
            `0x${diff.position.toString(16).padStart(8, "0")},` +
            `${
              diff.byte1 !== null
                ? "0x" + diff.byte1.toString(16).padStart(2, "0")
                : "N/A"
            },` +
            `${diff.char1 || "N/A"},` +
            `${
              diff.byte2 !== null
                ? "0x" + diff.byte2.toString(16).padStart(2, "0")
                : "N/A"
            },` +
            `${diff.char2 || "N/A"}`
          );
        })
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "diferencias_hex_texto.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate pagination buttons
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    // Always show first page
    pages.push(
      <Button
        key="first"
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => handlePageChange(1)}
        className="w-8 h-8 p-0"
      >
        1
      </Button>
    );

    // Calculate range of pages to show
    const startPage = Math.max(
      2,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

    // Adjust if we're near the beginning
    if (startPage > 2) {
      pages.push(
        <span key="ellipsis1" className="px-1">
          ...
        </span>
      );
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="w-8 h-8 p-0"
        >
          {i}
        </Button>
      );
    }

    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      pages.push(
        <span key="ellipsis2" className="px-1">
          ...
        </span>
      );
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(
        <Button
          key="last"
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          className="w-8 h-8 p-0"
        >
          {totalPages}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-1 mt-4">{pages}</div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4" />
          Ver Todas las Diferencias Hex
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Diferencias Hexadecimales con Traducción de Texto
          </DialogTitle>
          <DialogDescription>
            Mostrando las {differences.length} diferencias de bytes entre los
            archivos con traducciones de texto plano
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar posición, valor hex o texto..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard("table")}
            title="Copiar como tabla"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={downloadCSV}
            title="Descargar como CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm mb-2 flex flex-wrap gap-x-4 gap-y-1">
          <div className="flex items-center gap-1">
            <FileDigit className="w-4 h-4 text-primary" />
            <span className="font-medium">Archivo 1:</span> {file1Name} (
            {file1Size} bytes)
          </div>
          <div className="flex items-center gap-1">
            <FileDigit className="w-4 h-4 text-primary" />
            <span className="font-medium">Archivo 2:</span> {file2Name} (
            {file2Size} bytes)
          </div>
        </div>

        <Tabs defaultValue="detailed" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detailed" className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Vista Detallada
            </TabsTrigger>
            <TabsTrigger value="compact" className="flex items-center gap-1">
              <FileDigit className="w-4 h-4" />
              Vista Compacta
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="detailed"
            className="overflow-y-auto max-h-[60vh]"
          >
            {filteredByteValues.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {byteValues.length === 0
                  ? "No se encontraron diferencias"
                  : "No hay coincidencias para tu búsqueda"}
              </p>
            ) : (
              <>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="px-3 py-2 text-left font-medium">
                          Posición
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Archivo 1 Hex
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Archivo 1 Texto
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Archivo 2 Hex
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Archivo 2 Texto
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((diff) => (
                        <tr
                          key={diff.position}
                          className="border-b last:border-0 hover:bg-muted/30"
                        >
                          <td className="px-3 py-2 font-mono">
                            0x{diff.position.toString(16).padStart(8, "0")}
                          </td>
                          <td
                            className={`px-3 py-2 font-mono ${
                              diff.byte1 !== diff.byte2
                                ? "bg-red-100 dark:bg-red-900/20"
                                : ""
                            }`}
                          >
                            {diff.byte1 !== null
                              ? "0x" + diff.byte1.toString(16).padStart(2, "0")
                              : "N/A"}
                          </td>
                          <td
                            className={`px-3 py-2 font-mono ${
                              diff.char1 !== diff.char2
                                ? "bg-red-100 dark:bg-red-900/20"
                                : ""
                            }`}
                          >
                            {diff.char1 || "N/A"}
                          </td>
                          <td
                            className={`px-3 py-2 font-mono ${
                              diff.byte1 !== diff.byte2
                                ? "bg-red-100 dark:bg-red-900/20"
                                : ""
                            }`}
                          >
                            {diff.byte2 !== null
                              ? "0x" + diff.byte2.toString(16).padStart(2, "0")
                              : "N/A"}
                          </td>
                          <td
                            className={`px-3 py-2 font-mono ${
                              diff.char1 !== diff.char2
                                ? "bg-red-100 dark:bg-red-900/20"
                                : ""
                            }`}
                          >
                            {diff.char2 || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {renderPagination()}

                <div className="text-xs text-muted-foreground text-center mt-4">
                  Mostrando {currentItems.length} de {filteredByteValues.length}{" "}
                  diferencias
                  {searchTerm &&
                    filteredByteValues.length !== byteValues.length &&
                    ` (filtrado de ${byteValues.length} totales)`}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="compact" className="overflow-y-auto max-h-[60vh]">
            {filteredByteValues.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {byteValues.length === 0
                  ? "No se encontraron diferencias"
                  : "No hay coincidencias para tu búsqueda"}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2">
                  {currentItems.map((diff) => (
                    <div
                      key={diff.position}
                      className="border rounded-md p-2 text-xs hover:bg-muted/30"
                    >
                      <div className="font-mono text-muted-foreground mb-1">
                        0x{diff.position.toString(16).padStart(8, "0")}
                      </div>
                      <div className="grid grid-cols-2 gap-x-2">
                        <div>
                          <div className="font-semibold text-xs">Archivo 1</div>
                          <div
                            className={`font-mono ${
                              diff.byte1 !== diff.byte2
                                ? "text-red-500 dark:text-red-400"
                                : ""
                            }`}
                          >
                            {diff.byte1 !== null
                              ? "0x" + diff.byte1.toString(16).padStart(2, "0")
                              : "N/A"}
                          </div>
                          <div
                            className={`font-mono ${
                              diff.char1 !== diff.char2
                                ? "text-red-500 dark:text-red-400"
                                : ""
                            }`}
                          >
                            {diff.char1 || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-xs">Archivo 2</div>
                          <div
                            className={`font-mono ${
                              diff.byte1 !== diff.byte2
                                ? "text-red-500 dark:text-red-400"
                                : ""
                            }`}
                          >
                            {diff.byte2 !== null
                              ? "0x" + diff.byte2.toString(16).padStart(2, "0")
                              : "N/A"}
                          </div>
                          <div
                            className={`font-mono ${
                              diff.char1 !== diff.char2
                                ? "text-red-500 dark:text-red-400"
                                : ""
                            }`}
                          >
                            {diff.char2 || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {renderPagination()}

                <div className="text-xs text-muted-foreground text-center mt-4">
                  Mostrando {currentItems.length} de {filteredByteValues.length}{" "}
                  diferencias
                  {searchTerm &&
                    filteredByteValues.length !== byteValues.length &&
                    ` (filtrado de ${byteValues.length} totales)`}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
