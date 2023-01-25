import { BrowserWebview } from './BrowserWebview';

export type TabViewProps = {
  isResizing: boolean;
};

export const TabView = ({ isResizing }: TabViewProps) => {
  return (
    <div
      style={{
        overflow: 'hidden',
        width: 'inherit',
        height: 'inherit',
        transform: 'translateZ(0)',
      }}
    >
      <BrowserWebview isLocked={isResizing} />
    </div>
  );
};
