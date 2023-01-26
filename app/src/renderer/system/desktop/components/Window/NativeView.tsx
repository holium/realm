import { useRef } from 'react';
import { WindowModelProps } from 'os/services/shell/desktop.model';
import { nativeRenderers, WindowId } from 'renderer/apps/native';

export interface NativeViewProps {
  window: WindowModelProps | any;
  isResizing?: boolean;
  hasTitlebar: boolean | undefined;
}

export const NativeView = ({ window, isResizing }: NativeViewProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const ViewComponent = nativeRenderers[window.id as WindowId].component;

  return (
    <div
      style={{
        overflowY: 'auto',
        overflowX: 'hidden',
        width: 'inherit',
        height: 'inherit',
      }}
      ref={elementRef}
    >
      {ViewComponent && <ViewComponent isResizing={Boolean(isResizing)} />}
    </div>
  );
};
