
import { Asset } from "@/components/AssetManager";
import { EditorMode } from "@/components/ModeSelector";

export interface ProjectSaveState {
  version: number;
  editorMode: EditorMode;
  generatedCode: string; // For backward compatibility with old save files
  files?: { [filename: string]: string }; // New field for multi-file support
  activeFilename?: string; // Active file when the project was saved
  assets: Asset[];
}
