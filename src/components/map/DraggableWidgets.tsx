// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Move, 
  Maximize2, 
  Minimize2, 
  X as CloseIcon, 
  Settings as SettingsIcon,
  TrendingUp,
  TrendingDown,
  Activity,
  Signal,
  Zap,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Widget {
  id: string;
  title: string;
  content: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isDragging: boolean;
  style?: 'solid' | 'glass' | 'outlined';
}

interface WidgetControlsProps {
  widget: Widget;
  onMinimize: (id: string) => void;
  onClose: (id: string) => void;
  onStartDrag: (id: string) => void;
  onOpenSettings: (id: string) => void;
  visible: boolean;
}

const STORAGE_KEY = 'overwatch-widgets-layout';

const WidgetControls: React.FC<WidgetControlsProps> = ({ 
  widget, 
  onMinimize, 
  onClose, 
  onStartDrag,
  onOpenSettings,
  visible
}) => {
  if (!visible) return null;
  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-slate-400 hover:text-cyan-400"
        onMouseDown={() => onStartDrag(widget.id)}
      >
        <Move className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-slate-400 hover:text-cyan-400"
        onClick={() => onMinimize(widget.id)}
      >
        {widget.isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-slate-400 hover:text-cyan-400"
        onClick={() => onOpenSettings(widget.id)}
      >
        <SettingsIcon className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
        onClick={() => onClose(widget.id)}
      >
        <CloseIcon className="h-3 w-3" />
      </Button>
    </div>
  );
};

interface DraggableWidgetsProps {
  isVisible?: boolean;
  terminologyMode?: 'military' | 'civilian' | 'both';
  onLayoutChange?: (layout: any) => void;
  editMode?: boolean;
}

const DraggableWidgets: React.FC<DraggableWidgetsProps> = ({
  isVisible = true,
  terminologyMode = 'military',
  onLayoutChange,
  editMode = false
}) => {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return [
      {
        id: 'comms',
        title: 'Communications',
        content: (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Active Channels</span>
              <Badge variant="outline" className="text-green-400 border-green-500/30">
                SECURE
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>Alpha Team</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span>Bravo Team</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <span>Command</span>
              </div>
            </div>
          </div>
        ),
        position: { x: 20, y: 100 },
        size: { width: 200, height: 150 },
        isMinimized: false,
        isDragging: false,
        style: 'glass'
      },
      {
        id: 'intel',
        title: 'Intelligence Feed',
        content: (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span className="text-slate-300">New threat detected</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Shield className="w-3 h-3 text-blue-400" />
              <span className="text-slate-300">Perimeter secure</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Signal className="w-3 h-3 text-green-400" />
              <span className="text-slate-300">Sat link established</span>
            </div>
          </div>
        ),
        position: { x: 240, y: 120 },
        size: { width: 220, height: 140 },
        isMinimized: false,
        isDragging: false,
        style: 'solid'
      }
    ];
  });

  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedWidget: null as string | null,
    offset: { x: 0, y: 0 }
  });

  const [settingsOpenFor, setSettingsOpenFor] = useState<string | null>(null);

  const handleStartDrag = (id: string) => {
    if (!editMode) return;
    setDragState({
      isDragging: true,
      draggedWidget: id,
      offset: { x: 0, y: 0 }
    });
  };

  const handleMinimize = (id: string) => {
    setWidgets(widgets.map(widget => 
      widget.id === id 
        ? { ...widget, isMinimized: !widget.isMinimized }
        : widget
    ));
  };

  const handleClose = (id: string) => {
    setWidgets(widgets.filter(widget => widget.id !== id));
  };

  const handleOpenSettings = (id: string) => setSettingsOpenFor(id);
  const handleCloseSettings = () => setSettingsOpenFor(null);
  const handleApplySettings = (id: string, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    setSettingsOpenFor(null);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState.isDragging && dragState.draggedWidget) {
        setWidgets(widgets.map(widget =>
          widget.id === dragState.draggedWidget
            ? {
                ...widget,
                position: {
                  x: e.clientX - dragState.offset.x,
                  y: e.clientY - dragState.offset.y
                }
              }
            : widget
        ));
      }
    };

    const handleMouseUp = () => {
      setDragState({
        isDragging: false,
        draggedWidget: null,
        offset: { x: 0, y: 0 }
      });
    };

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, widgets]);

  useEffect(() => {
    onLayoutChange?.(widgets);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets)); } catch { /* ignore */ }
  }, [widgets, onLayoutChange]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[500]">
      {widgets.map(widget => {
        const styleClass = widget.style === 'glass'
          ? 'bg-slate-900/70 backdrop-blur-md border-cyan-500/30'
          : widget.style === 'outlined'
          ? 'bg-slate-900/95 border-cyan-500/50'
          : 'bg-slate-900/95 border-cyan-500/30';
        return (
          <Card
            key={widget.id}
            className={`absolute pointer-events-auto ${styleClass}`}
            style={{
              left: widget.position.x,
              top: widget.position.y,
              width: widget.size.width,
              height: widget.isMinimized ? 'auto' : widget.size.height,
              cursor: dragState.draggedWidget === widget.id ? 'grabbing' : (editMode ? 'grab' : 'default')
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-cyan-400 text-sm">
                  {widget.title}
                </CardTitle>
                <WidgetControls
                  widget={widget}
                  onMinimize={handleMinimize}
                  onClose={handleClose}
                  onStartDrag={handleStartDrag}
                  onOpenSettings={handleOpenSettings}
                  visible={editMode}
                />
              </div>
            </CardHeader>
            {!widget.isMinimized && (
              <CardContent className="pt-0">
                {widget.content}
              </CardContent>
            )}
            {settingsOpenFor === widget.id && (
              <Dialog open onOpenChange={(o) => !o && handleCloseSettings()}>
                <DialogContent className="pointer-events-auto">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm">Title</label>
                      <Input defaultValue={widget.title} onChange={(e) => handleApplySettings(widget.id, { title: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm">Shell Style</label>
                      <Select value={widget.style || 'solid'} onValueChange={(style: any) => handleApplySettings(widget.id, { style })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="glass">Glass</SelectItem>
                          <SelectItem value="outlined">Outlined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default DraggableWidgets;
