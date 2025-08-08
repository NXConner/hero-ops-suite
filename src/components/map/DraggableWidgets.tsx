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
  Settings,
  TrendingUp,
  TrendingDown,
  Activity,
  Signal,
  Zap,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface Widget {
  id: string;
  title: string;
  content: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isDragging: boolean;
}

interface WidgetControlsProps {
  widget: Widget;
  onMinimize: (id: string) => void;
  onClose: (id: string) => void;
  onStartDrag: (id: string) => void;
}

const WidgetControls: React.FC<WidgetControlsProps> = ({ 
  widget, 
  onMinimize, 
  onClose, 
  onStartDrag 
}) => {
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
        className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
        onClick={() => onClose(widget.id)}
      >
        <CloseIcon className="h-3 w-3" />
      </Button>
    </div>
  );
};

const DraggableWidgets: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([
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
      isDragging: false
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
      isDragging: false
    }
  ]);

  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedWidget: null as string | null,
    offset: { x: 0, y: 0 }
  });

  const handleStartDrag = (id: string) => {
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

  return (
    <div className="absolute inset-0 pointer-events-none z-[500]">
      {widgets.map(widget => (
        <Card
          key={widget.id}
          className="absolute pointer-events-auto bg-slate-900/95 border-cyan-500/30 backdrop-blur-sm"
          style={{
            left: widget.position.x,
            top: widget.position.y,
            width: widget.size.width,
            height: widget.isMinimized ? 'auto' : widget.size.height,
            cursor: dragState.draggedWidget === widget.id ? 'grabbing' : 'default'
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
              />
            </div>
          </CardHeader>
          {!widget.isMinimized && (
            <CardContent className="pt-0">
              {widget.content}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default DraggableWidgets;
