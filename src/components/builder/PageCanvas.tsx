// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface CanvasWidget {
  key: string;
  component: React.ReactNode;
  defaultW: number;
  defaultH: number;
}

interface PageCanvasProps {
  pageId: string;
  widgets: Record<string, CanvasWidget>;
  isEditing?: boolean;
}

export default function PageCanvas({ pageId, widgets, isEditing = true }: PageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);
  useEffect(() => {
    const onResize = () => {
      if (containerRef.current) setWidth(containerRef.current.clientWidth);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const storageKey = `builder-layout-${pageId}`;
  const styleKey = `builder-styles-${pageId}`;

  const [layout, setLayout] = useState<Layout[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [stylesMap, setStylesMap] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(styleKey) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(layout));
    } catch {
      /* ignore */
    }
  }, [layout, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(styleKey, JSON.stringify(stylesMap));
    } catch {
      /* ignore */
    }
  }, [stylesMap, styleKey]);

  const initialLayout = useMemo(() => layout, []);

  const removeItem = (i: string) => {
    const next = layout.filter((l) => l.i !== i);
    setLayout(next);
  };

  const shellClass = (style: string | undefined) => {
    switch (style) {
      case "glass":
        return "bg-card/40 backdrop-blur border border-border/40";
      case "outlined":
        return "bg-transparent border border-border";
      case "solid":
      default:
        return "bg-card border border-border/60";
    }
  };

  return (
    <div className="w-full h-full" ref={containerRef}>
      <GridLayout
        className="layout"
        cols={12}
        rowHeight={30}
        width={width}
        isDraggable={isEditing}
        isResizable={isEditing}
        layout={initialLayout}
        onLayoutChange={(l) => setLayout(l)}
      >
        {layout.map((item) => (
          <div key={item.i} className="overflow-hidden">
            <div className={`h-full rounded-md ${shellClass(stylesMap[item.i])}`}>
              {isEditing && (
                <div className="flex items-center justify-between px-2 py-1 border-b border-border/40">
                  <div className="text-xs text-muted-foreground">{item.i}</div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={stylesMap[item.i] || "solid"}
                      onValueChange={(v) => setStylesMap((prev) => ({ ...prev, [item.i]: v }))}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="glass">Glass</SelectItem>
                        <SelectItem value="outlined">Outlined</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="ghost" onClick={() => removeItem(item.i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="p-2 h-[calc(100%-32px)]">{widgets[item.i]?.component}</div>
            </div>
          </div>
        ))}
      </GridLayout>
    </div>
  );
}
