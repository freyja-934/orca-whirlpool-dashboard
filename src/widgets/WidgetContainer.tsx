'use client';
import { useWidgetStore } from '@/store/widgetStore';
import { Move, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { widgetMap } from './widgetConfig';

export default function WidgetContainer() {
  const { widgets, setWidgets, removeWidget, updateWidgetConfig } = useWidgetStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  return (
    <>
      {widgets.map(({ id, type, x, y, width, height, config }) => {
        const Component = widgetMap[type];
        
        const widgetProps = (type === 'priceFeed' || type === 'livePoolChart') ? {
          widgetId: id,
          config,
          onConfigUpdate: (newConfig: Record<string, unknown>) => updateWidgetConfig(id, newConfig)
        } : undefined;
        
        return (
          <Rnd
            key={id}
            size={{ width, height }}
            position={{ x, y }}
            onDragStop={(_, d) =>
              setWidgets(
                widgets.map((w) =>
                  w.id === id ? { ...w, x: d.x, y: d.y } : w
                )
              )
            }
            onResizeStop={(_, __, ref, delta, position) =>
              setWidgets(
                widgets.map((w) =>
                  w.id === id
                    ? {
                        ...w,
                        width: ref.offsetWidth,
                        height: ref.offsetHeight,
                        ...position
                      }
                    : w
                )
              )
            }
            minWidth={200}
            minHeight={150}
            bounds="parent"
            dragHandleClassName="widget-drag-handle"
            className="rounded-lg shadow-lg border border-border/50 bg-background/95 backdrop-blur-sm overflow-hidden"
          >
            <div className="h-full flex flex-col">
              <div className="widget-drag-handle flex justify-between items-center px-3 py-2 border-b bg-muted/50 cursor-move">
                <div className="flex items-center gap-2">
                  <Move className="h-3 w-3 text-muted-foreground" />
                  <span className="font-semibold text-xs capitalize">
                    {type === 'lp' ? 'My LP Positions' : 
                     type === 'explorer' ? 'Pool Explorer' : 
                     type === 'priceFeed' ? 'Price Feed' :
                     type === 'livePoolChart' ? 'Live Pool Chart' :
                     type}
                  </span>
                </div>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => removeWidget(id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <Component {...widgetProps} />
              </div>
            </div>
          </Rnd>
        );
      })}
    </>
  );
} 