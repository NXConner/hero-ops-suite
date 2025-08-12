// @ts-nocheck
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, Edit } from 'lucide-react';

interface ToolbarProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
}

export default function Toolbar({ isEditing, onToggleEdit, onExport, onImport }: ToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant={isEditing ? 'default' : 'outline'} onClick={onToggleEdit} className="flex items-center gap-2">
        <Edit className="h-4 w-4" /> {isEditing ? 'Editing' : 'Edit Layout'}
      </Button>
      <Button variant="outline" onClick={onExport} className="flex items-center gap-2">
        <Download className="h-4 w-4" /> Export
      </Button>
      <label className="inline-flex items-center gap-2 text-sm border rounded px-3 py-2 cursor-pointer">
        <Upload className="h-4 w-4" /> Import
        <input type="file" accept="application/json" hidden onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onImport(String(reader.result));
          reader.readAsText(file);
        }} />
      </label>
    </div>
  );
}