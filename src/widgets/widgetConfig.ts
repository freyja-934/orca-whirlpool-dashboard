import ExplorerWidget from './ExplorerWidget';
import LPWidget from './LPWidget';
import LivePoolChartWidget from './LivePoolChartWidget';
import PriceFeedWidget from './PriceFeedWidget';

export const widgetMap = {
  lp: LPWidget,
  explorer: ExplorerWidget,
  priceFeed: PriceFeedWidget,
  livePoolChart: LivePoolChartWidget
} as const;

export type WidgetType = keyof typeof widgetMap; 