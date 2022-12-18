import { FC, useRef } from 'react';
import styled from 'styled-components';
import { WindowModelProps } from 'os/services/shell/desktop.model';
import { nativeRenderers } from 'renderer/apps/native';

export interface NativeViewProps {
  window: WindowModelProps | any;
  isResizing?: boolean;
  hasTitlebar: boolean | undefined;
}

const View = styled.div<{ hasTitleBar?: boolean }>``;

export const NativeView: FC<NativeViewProps> = (props: NativeViewProps) => {
  const { window, isResizing } = props;

  const elementRef = useRef(null);
  const ViewComponent: FC<any> | undefined =
    nativeRenderers[window.id].component;

  return (
    <View
      style={{
        overflowY: 'auto',
        overflowX: 'hidden',
        width: 'inherit',
        height: 'inherit',
      }}
      ref={elementRef}
    >
      {ViewComponent && <ViewComponent isResizing={isResizing} />}
    </View>
  );
};
