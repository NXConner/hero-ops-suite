// @ts-nocheck
import React, { useMemo, useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WidgetLibrary, { LibraryWidget } from "@/components/builder/WidgetLibrary";
import PageCanvas from "@/components/builder/PageCanvas";
import Toolbar from "@/components/builder/Toolbar";
import { Users, Cloud, Activity, Target } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Builder() {
  const [isEditing, setIsEditing] = useState(false);
  const [pages, setPages] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("builder-pages") || "[]") || ["default"];
    } catch {
      return ["default"];
    }
  });
  const [pageId, setPageId] = useState<string>(() => pages[0] || "default");

  useEffect(() => {
    try {
      localStorage.setItem("builder-pages", JSON.stringify(pages));
    } catch {
      /* ignore */
    }
  }, [pages]);

  const library: LibraryWidget[] = [
    { id: "fleet", name: "Fleet/Follow", icon: <Users className="h-4 w-4" /> },
    { id: "weather", name: "Weather", icon: <Cloud className="h-4 w-4" /> },
    { id: "pavement", name: "Pavement Scan", icon: <Activity className="h-4 w-4" /> },
    { id: "mission", name: "Mission Status", icon: <Target className="h-4 w-4" /> },
  ];

  const widgets = useMemo(
    () => ({
      fleet: {
        key: "fleet",
        defaultW: 4,
        defaultH: 4,
        component: <div className="p-4">Fleet/Follow</div>,
      },
      weather: {
        key: "weather",
        defaultW: 4,
        defaultH: 4,
        component: <div className="p-4">Weather</div>,
      },
      pavement: {
        key: "pavement",
        defaultW: 4,
        defaultH: 4,
        component: <div className="p-4">Pavement Scan</div>,
      },
      mission: {
        key: "mission",
        defaultW: 4,
        defaultH: 4,
        component: <div className="p-4">Mission Status</div>,
      },
    }),
    [],
  );

  function handleAddWidget(id: string) {
    const key = `builder-layout-${pageId}`;
    const raw = localStorage.getItem(key);
    const layout = raw ? JSON.parse(raw) : [];
    const next = [
      ...layout,
      {
        i: id,
        x: (layout.length * 2) % 12,
        y: 0,
        w: widgets[id].defaultW,
        h: widgets[id].defaultH,
      },
    ];
    localStorage.setItem(key, JSON.stringify(next));
    window.location.reload();
  }

  function handleExport() {
    const key = `builder-layout-${pageId}`;
    const raw = localStorage.getItem(key) || "[]";
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pageId}-layout.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImport(json: string) {
    try {
      JSON.parse(json); // simple validation
      localStorage.setItem(`builder-layout-${pageId}`, json);
      window.location.reload();
    } catch {
      /* ignore */
    }
  }

  function handleCreatePage() {
    const input = document.getElementById("new-page-name") as HTMLInputElement;
    const name = input?.value?.trim();
    if (!name || pages.includes(name)) return;
    setPages((prev) => [...prev, name]);
    setPageId(name);
    input.value = "";
  }

  function handleDeletePage() {
    if (pages.length <= 1) return;
    const idx = pages.indexOf(pageId);
    const nextPages = pages.filter((p) => p !== pageId);
    setPages(nextPages);
    setPageId(nextPages[Math.max(0, idx - 1)] || "default");
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Page Builder</h1>
            <Select value={pageId} onValueChange={setPageId}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pages.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input id="new-page-name" placeholder="New page name" className="w-40" />
            <Button variant="outline" onClick={handleCreatePage}>
              Create
            </Button>
            <Button variant="ghost" onClick={handleDeletePage} disabled={pages.length <= 1}>
              Delete
            </Button>
          </div>
          <Toolbar
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
            onExport={handleExport}
            onImport={handleImport}
          />
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <WidgetLibrary widgets={library} onAdd={handleAddWidget} />
          </div>
          <div className="col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Canvas</CardTitle>
              </CardHeader>
              <CardContent>
                <PageCanvas pageId={pageId} widgets={widgets} isEditing={isEditing} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
