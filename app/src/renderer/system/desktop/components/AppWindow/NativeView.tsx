import { FC, useRef } from 'react';
import styled from 'styled-components';
import { WindowModelType } from 'renderer/logic-old/desktop/store';
import { nativeApps } from 'renderer/apps';

export interface NativeViewProps {
  window: WindowModelType | any;
  isResizing?: boolean;
  hasTitlebar: boolean | undefined;
}

const View = styled.div<{ hasTitleBar?: boolean }>``;

export const NativeView: FC<NativeViewProps> = (props: NativeViewProps) => {
  const { window, isResizing } = props;

  const elementRef = useRef(null);
  const ViewComponent: FC<any> | undefined =
    nativeApps[window.id].native?.component!;

  return (
    <View
      style={{
        overflowY: 'scroll',
        overflowX: 'hidden',
        width: 'inherit',
        height: 'inherit',
      }}
      ref={elementRef}
    >
      {nativeApps[window.id].native?.component && (
        <ViewComponent isResizing={isResizing} />
      )}
    </View>
  );
};
