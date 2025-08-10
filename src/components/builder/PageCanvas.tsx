// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Card } from '@/components/ui/card';

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
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const storageKey = `builder-layout-${pageId}`;
  const [layout, setLayout] = useState<Layout[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(layout)); } catch {}
  }, [layout, storageKey]);

  const initialLayout = useMemo(() => layout, []);

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
        {layout.map(item => (
          <div key={item.i} className="overflow-hidden">
            <Card className="h-full">
              {widgets[item.i]?.component}
            </Card>
          </div>
        ))}
      </GridLayout>
    </div>
  );
}