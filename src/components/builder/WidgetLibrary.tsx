// @ts-nocheck
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Cloud, Activity, Target } from "lucide-react";

export interface LibraryWidget {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

interface WidgetLibraryProps {
  widgets: LibraryWidget[];
  onAdd: (id: string) => void;
}

export default function WidgetLibrary({ widgets, onAdd }: WidgetLibraryProps) {
  const iconFor = (id: string) => {
    switch (id) {
      case "fleet":
        return <Users className="h-4 w-4 text-cyan-400" />;
      case "weather":
        return <Cloud className="h-4 w-4 text-blue-400" />;
      case "pavement":
        return <Activity className="h-4 w-4 text-orange-400" />;
      case "mission":
        return <Target className="h-4 w-4 text-green-400" />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-card/50 border border-border/50">
      <CardHeader>
        <CardTitle className="text-sm">Widget Library</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {widgets.map((w) => (
          <div
            key={w.id}
            className="flex items-center justify-between p-2 rounded border border-border/30"
          >
            <div className="flex items-center gap-2">
              {iconFor(w.id)}
              <span className="text-sm">{w.name}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => onAdd(w.id)}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
