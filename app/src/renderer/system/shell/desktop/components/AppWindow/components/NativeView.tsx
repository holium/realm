import { FC, useRef } from 'react';
import styled from 'styled-components';
import { WindowModelType } from 'renderer/logic/desktop/store';
import { nativeApps } from 'renderer/system/apps';

interface AppViewProps {
  window: WindowModelType | any;
  hasTitlebar: boolean | undefined;
}

const View = styled.div<{ hasTitleBar?: boolean }>``;

export const NativeView: FC<AppViewProps> = (props: AppViewProps) => {
  const { window } = props;

  const elementRef = useRef(null);

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
      {nativeApps[window.id].native?.component}
    </View>
  );
};
