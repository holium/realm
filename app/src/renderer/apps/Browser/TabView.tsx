import { WebView } from './WebView';

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
      <WebView isLocked={isResizing} />
    </div>
  );
};
