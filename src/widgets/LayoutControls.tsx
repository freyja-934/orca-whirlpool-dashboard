'use client';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useWidgetStore } from '@/store/widgetStore';
import { ChevronDown, FileDown, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function LayoutControls() {
  const { savedLayouts, saveLayout, loadLayout, deleteLayout, resetLayout } = useWidgetStore();
  const [layoutName, setLayoutName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleSave = () => {
    if (layoutName.trim()) {
      saveLayout(layoutName);
      setLayoutName('');
      setShowSaveInput(false);
    }
  };

  const layoutNames = Object.keys(savedLayouts);

  return (
    <div className="flex gap-2 items-center">
      {showSaveInput ? (
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Layout name..."
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="h-8 w-40"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!layoutName.trim()}
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowSaveInput(false);
              setLayoutName('');
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSaveInput(true)}
            className="gap-2"
          >
            <Save className="h-3 w-3" />
            Save Layout
          </Button>

          {layoutNames.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <FileDown className="h-3 w-3" />
                  Load Layout
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Saved Layouts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {layoutNames.map((name) => (
                  <DropdownMenuItem
                    key={name}
                    className="flex justify-between items-center"
                  >
                    <span
                      className="flex-1 cursor-pointer"
                      onClick={() => loadLayout(name)}
                    >
                      {name}
                    </span>
                    <button
                      className="ml-2 text-destructive hover:text-destructive/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayout(name);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={resetLayout}
            className="gap-2"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </>
      )}
    </div>
  );
} 