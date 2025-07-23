import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface WidgetConfig {
  selectedTokens?: string[];
  sortBy?: string;
  [key: string]: unknown;
}

interface Widget {
  id: string;
  type: 'lp' | 'explorer' | 'priceFeed' | 'livePoolChart';
  x: number;
  y: number;
  width: number;
  height: number;
  config?: WidgetConfig;
}

interface WidgetStore {
  widgets: Widget[];
  savedLayouts: Record<string, Widget[]>;
  setWidgets: (widgets: Widget[]) => void;
  addWidget: (type: Widget['type']) => void;
  removeWidget: (id: string) => void;
  updateWidgetConfig: (id: string, config: WidgetConfig) => void;
  saveLayout: (name: string) => void;
  loadLayout: (name: string) => void;
  deleteLayout: (name: string) => void;
  resetLayout: () => void;
}

const defaultWidgets: Widget[] = [
  { id: nanoid(), type: 'lp', x: 0, y: 0, width: 400, height: 200 },
  { id: nanoid(), type: 'explorer', x: 420, y: 0, width: 400, height: 300 },
  { id: nanoid(), type: 'priceFeed', x: 0, y: 220, width: 300, height: 150 }
];

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      widgets: defaultWidgets,
      savedLayouts: {},
      
      setWidgets: (widgets) => set({ widgets }),
      
      addWidget: (type) =>
        set((state) => ({
          widgets: [
            ...state.widgets,
            { 
              id: nanoid(), 
              type, 
              x: 100 + Math.random() * 100,
              y: 100 + Math.random() * 100, 
              width: 300, 
              height: 200 
            }
          ]
        })),
        
      removeWidget: (id) =>
        set((state) => ({ widgets: state.widgets.filter((w) => w.id !== id) })),
        
      updateWidgetConfig: (id, config) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, config } : w
          )
        })),
        
      saveLayout: (name) =>
        set((state) => ({
          savedLayouts: {
            ...state.savedLayouts,
            [name]: [...state.widgets]
          }
        })),
        
      loadLayout: (name) => {
        const layout = get().savedLayouts[name];
        if (layout) {
          set({ widgets: [...layout] });
        }
      },
      
      deleteLayout: (name) =>
        set((state) => {
          const { [name]: _, ...rest } = state.savedLayouts;
          return { savedLayouts: rest };
        }),
        
      resetLayout: () => set({ widgets: defaultWidgets.map(w => ({ ...w, id: nanoid() })) }),
    }),
    {
      name: 'widget-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        widgets: state.widgets,
        savedLayouts: state.savedLayouts
      }),
    }
  )
); 