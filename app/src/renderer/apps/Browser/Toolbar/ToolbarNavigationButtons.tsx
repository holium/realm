import { RefObject } from 'react';
import { Flex } from 'renderer/components';
import { AppWindowIcon } from 'renderer/system/desktop/components/AppWindow/AppWindowIcon';

type Props = {
  innerRef: RefObject<HTMLDivElement>;
  iconColor: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
};

export const ToolbarNavigationButtons = ({
  innerRef,
  iconColor,
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
      iconColor={iconColor}
      bg="#97A3B2"
      onClick={onBack}
    />
    <AppWindowIcon
      icon="ArrowRightLine"
      disabled={!canGoForward}
      iconColor={iconColor}
      bg="#97A3B2"
      onClick={onForward}
    />
    <AppWindowIcon
      icon="Refresh"
      iconColor={iconColor}
      bg="#97A3B2"
      onClick={onRefresh}
    />
  </Flex>
);
