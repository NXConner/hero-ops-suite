// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { GripVertical, RefreshCw, ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';

interface NavItemConfig {
  name: string;
  href: string;
  icon: string;
  hidden?: boolean;
  badge?: string;
  parent?: string | null;
}

const iconOptions = [
  'LayoutDashboard',
  'Radar',
  'Target',
  'Users',
  'BarChart3',
  'MessageSquare',
  'FileText',
  'Scan',
  'Shield',
  'Settings'
];

export default function NavigationEditor() {
  const [items, setItems] = useState<NavItemConfig[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sidebar-nav-config');
      const data: NavItemConfig[] = raw ? JSON.parse(raw) : [];
      setItems(data);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('sidebar-nav-config', JSON.stringify(items)); } catch {}
  }, [items]);

  function onDragStart(index: number) {
    setDragIndex(index);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setItems(prev => {
      const copy = [...prev];
      const [removed] = copy.splice(dragIndex, 1);
      copy.splice(index, 0, removed);
      return copy;
    });
    setDragIndex(index);
  }

  function indent(index: number) {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, parent: prev[i-1]?.href || null } : it));
  }

  function outdent(index: number) {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, parent: null } : it));
  }

  function resetToDefault() {
    try { localStorage.removeItem('sidebar-nav-config'); } catch {}
    window.location.reload();
  }

  function level(item: NavItemConfig) {
    return item.parent ? 1 : 0;
  }

  if (!items.length) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <CardTitle>Navigation Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No navigation loaded. Open the sidebar once to initialize, then return here.</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">Reload</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Navigation Editor</CardTitle>
        <Button variant="outline" size="sm" onClick={resetToDefault} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.href}
            className="flex items-center gap-3 p-3 rounded-md border border-border/50 bg-secondary/10"
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => onDragOver(e, index)}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="grid grid-cols-12 gap-2 flex-1 items-center" style={{ paddingLeft: `${level(item) * 16}px` }}>
              <div className="col-span-4">
                <Label className="text-xs">Label</Label>
                <Input
                  value={item.name}
                  onChange={(e) => setItems(prev => prev.map((it, i) => i === index ? { ...it, name: e.target.value } : it))}
                />
              </div>
              <div className="col-span-3">
                <Label className="text-xs">Path</Label>
                <Input
                  value={item.href}
                  onChange={(e) => setItems(prev => prev.map((it, i) => i === index ? { ...it, href: e.target.value } : it))}
                />
              </div>
              <div className="col-span-3">
                <Label className="text-xs">Icon</Label>
                <Select
                  value={item.icon}
                  onValueChange={(icon) => setItems(prev => prev.map((it, i) => i === index ? { ...it, icon } : it))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 flex flex-col items-center justify-end">
                <Label className="text-xs">Hide</Label>
                <Switch
                  checked={!!item.hidden}
                  onCheckedChange={(hidden) => setItems(prev => prev.map((it, i) => i === index ? { ...it, hidden } : it))}
                />
              </div>
              <div className="col-span-1 flex items-end justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={() => indent(index)}><ArrowRightToLine className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => outdent(index)}><ArrowLeftToLine className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}