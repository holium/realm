import { RefObject } from 'react';

import { Flex } from '@holium/design-system/general';

import { AppWindowIcon } from 'renderer/system/desktop/components/AppWindow/AppWindowIcon';

type Props = {
  innerRef: RefObject<HTMLDivElement>;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
};

export const ToolbarNavigationButtons = ({
  innerRef,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onRefresh,
}: Props) => (
  <Flex ref={innerRef} flexDirection="row" alignItems="center" gap={4}>
    <AppWindowIcon
      icon="ArrowLeftLine"
      disabled={!canGoBack}
      onClick={onBack}
    />
    <AppWindowIcon
      icon="ArrowRightLine"
      disabled={!canGoForward}
      onClick={onForward}
    />
    <AppWindowIcon icon="Refresh" onClick={onRefresh} />
  </Flex>
);
