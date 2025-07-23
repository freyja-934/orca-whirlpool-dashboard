'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWidgetStore } from '@/store/widgetStore';
import { Activity, BarChart3, Calculator, DollarSign, Plus, TrendingUp } from 'lucide-react';

interface AddWidgetControlsProps {
  onWidgetAdded?: (widgetName: string) => void;
}

export default function AddWidgetControls({ onWidgetAdded }: AddWidgetControlsProps) {
  const { addWidget } = useWidgetStore();
  
  const handleAddWidget = (type: 'lp' | 'explorer' | 'priceFeed' | 'livePoolChart', label: string) => {
    addWidget(type);
    
    if (onWidgetAdded) {
      onWidgetAdded(label);
    }
  };

  const widgetCategories = [
    {
      title: 'My LPs',
      icon: Activity,
      widgets: [
        {
          type: 'lp' as const,
          label: 'LP Positions',
          icon: Activity,
          description: 'View your liquidity positions'
        }
      ]
    },
    {
      title: 'Market',
      icon: TrendingUp,
      widgets: [
        {
          type: 'explorer' as const,
          label: 'Pool Explorer',
          icon: BarChart3,
          description: 'Browse top pools'
        },
        {
          type: 'priceFeed' as const,
          label: 'Price Feed',
          icon: DollarSign,
          description: 'Live token prices'
        },
        {
          type: 'livePoolChart' as const,
          label: 'Live Pool Chart',
          icon: BarChart3,
          description: 'Advanced charting with overlays'
        }
      ]
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {widgetCategories.map((category) => (
        <Card key={category.title} className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <category.icon className="h-4 w-4 text-muted-foreground" />
              {category.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {category.widgets.map(({ type, label, icon: Icon, description }) => (
              <Button
                key={type}
                onClick={() => handleAddWidget(type, label)}
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 h-auto py-2"
                title={description}
              >
                <Plus className="h-3 w-3" />
                <Icon className="h-3 w-3" />
                <div className="text-left flex-1">
                  <div className="text-xs font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">{description}</div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      ))}
      
      <Card className="border-border/50 opacity-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground text-center py-4">
            Coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 