import { ThemeToggle } from "@/components/theme-toggle";
import { FileDiff } from "lucide-react";

export function Header() {
  return (
    <header className="border-b dark:border-gray-800">
      <div className="container mx-auto py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileDiff className="w-5 h-5 text-primary" />
          <span className="font-semibold">Analizador de Archivos Binarios</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
