import {
  WindowModelProps,
  WindowModelType,
} from 'os/services/shell/desktop.model';
import { FC, useRef } from 'react';
import { dialogRenderers } from 'renderer/apps/dialog';
import styled from 'styled-components';

export interface DialogViewProps {
  window: WindowModelProps;
}

const View = styled.div<{ hasTitleBar?: boolean }>``;

export const DialogView: FC<DialogViewProps> = (props: DialogViewProps) => {
  const { window } = props;
  const elementRef = useRef(null);

  const ViewComponent: FC<any> | undefined =
    dialogRenderers[window.id].component!;

  return (
    <View
      style={{
        overflowY: 'scroll',
        overflowX: 'hidden',
        width: 'inherit',
        height: 'inherit',
        padding: '24px 24px',
      }}
      ref={elementRef}
    >
      {ViewComponent && <ViewComponent />}
    </View>
  );
};
