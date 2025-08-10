// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
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
}

export default function PageCanvas({ pageId, widgets }: PageCanvasProps) {
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
    <div className="w-full h-full">
      <GridLayout
        className="layout"
        cols={12}
        rowHeight={30}
        width={1200}
        isDraggable
        isResizable
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