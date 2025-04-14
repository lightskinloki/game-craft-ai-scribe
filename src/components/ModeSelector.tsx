
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type EditorMode = "general" | "phaser";

interface ModeSelectorProps {
  currentMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Mode:</span>
      <Select 
        value={currentMode} 
        onValueChange={(value) => onModeChange(value as EditorMode)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="general">General JavaScript</SelectItem>
          <SelectItem value="phaser">Phaser 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModeSelector;
