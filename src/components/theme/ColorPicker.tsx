// @ts-nocheck
import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ThemeColor } from "@/types/theme";
import { hslToString } from "@/lib/theme-utils";

interface Props {
  color: ThemeColor;
  onChange: (color: ThemeColor) => void;
  label?: string;
}

export default function ColorPicker({ color, onChange, label }: Props) {
  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="grid grid-cols-4 gap-2">
        <div>
          <Label className="text-xs">H</Label>
          <Slider
            value={[color.h]}
            onValueChange={([h]) => onChange({ ...color, h })}
            max={360}
            step={1}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground">{color.h}°</span>
        </div>
        <div>
          <Label className="text-xs">S</Label>
          <Slider
            value={[color.s]}
            onValueChange={([s]) => onChange({ ...color, s })}
            max={100}
            step={1}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground">{color.s}%</span>
        </div>
        <div>
          <Label className="text-xs">L</Label>
          <Slider
            value={[color.l]}
            onValueChange={([l]) => onChange({ ...color, l })}
            max={100}
            step={1}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground">{color.l}%</span>
        </div>
        <div className="flex items-end">
          <div
            className="w-8 h-8 rounded border border-border"
            style={{ backgroundColor: hslToString(color) }}
          />
        </div>
      </div>
    </div>
  );
}
