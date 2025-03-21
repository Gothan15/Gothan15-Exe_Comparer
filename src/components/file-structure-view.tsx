import type { FileStructureInfo, FileTypeInfo } from "types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatFileSize } from "@/utils/analyzer";
import {
  FileIcon,
  Layers,
  Code,
  Database,
  FileDigit,
  FileCode,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface FileStructureViewProps {
  fileName: string;
  fileSize: number;
  fileType: FileTypeInfo;
  fileStructure: FileStructureInfo;
}

export function FileStructureView({
  fileName,
  fileSize,
  fileType,
  fileStructure,
}: FileStructureViewProps) {
  // Choose icon based on file type
  const getFileIcon = () => {
    switch (fileType.type) {
      case "Windows Executable":
      case "ELF":
      case "Mach-O":
        return <FileCode className="w-5 h-5 text-primary" />;
      case "Text":
      case "XML":
      case "HTML":
      case "Script":
        return <FileIcon className="w-5 h-5 text-primary" />;
      case "PDF":
      case "DOCX":
      case "XLSX":
      case "PPTX":
        return <FileDigit className="w-5 h-5 text-primary" />;
      default:
        return <Database className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <Card className="dark:bg-gray-800/60">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {getFileIcon()}
          {fileName}
        </CardTitle>
        <CardDescription className="text-xs">
          {fileType.description} • {formatFileSize(fileSize)}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-primary/10">
            {fileType.type}
          </Badge>
          {fileType.subtype && (
            <Badge variant="outline" className="bg-primary/10">
              {fileType.subtype}
            </Badge>
          )}
          {fileType.architecture && (
            <Badge variant="outline" className="bg-primary/10">
              {fileType.architecture}
            </Badge>
          )}
        </div>

        {fileStructure.entryPoint && (
          <div className="text-sm">
            <span className="font-medium">Punto de entrada:</span>{" "}
            {fileStructure.entryPoint}
          </div>
        )}

        {fileStructure.headers && fileStructure.headers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Code className="w-4 h-4" /> Cabeceras
            </h4>
            <div className="text-xs space-y-1">
              {fileStructure.headers.map((header, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-muted-foreground">{header.name}:</span>
                  <span className="font-mono">{header.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {fileStructure.sections && fileStructure.sections.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Layers className="w-4 h-4" /> Secciones
            </h4>
            <div className="space-y-2">
              {fileStructure.sections.map((section, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium">{section.name}</span>
                    <span className="text-muted-foreground">
                      {formatFileSize(section.size)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={Math.min(100, (section.size / fileSize) * 100)}
                      className="h-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {section.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!fileStructure.sections || fileStructure.sections.length === 0) &&
          (!fileStructure.headers || fileStructure.headers.length === 0) && (
            <div className="text-sm text-muted-foreground italic">
              No hay información detallada de estructura disponible para este
              tipo de archivo.
            </div>
          )}
      </CardContent>
    </Card>
  );
}
