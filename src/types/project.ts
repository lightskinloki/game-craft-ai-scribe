
import { Asset } from "@/components/AssetManager";
import { EditorMode } from "@/components/ModeSelector";

export interface ProjectSaveState {
  version: number;
  editorMode: EditorMode;
  generatedCode: string;
  assets: Asset[];
}
