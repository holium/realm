import { Flex } from 'renderer/components';
import { WindowIcon } from 'renderer/system/desktop/components/AppWindow/WindowIcon';

type Props = {
  iconColor: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
};

export const ToolbarNavigationButtons = ({
  iconColor,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onRefresh,
}: Props) => (
  <Flex flexDirection="row" alignItems="center" gap={4}>
    <WindowIcon
      icon="ArrowLeftLine"
      disabled={!canGoBack}
      iconColor={iconColor}
      bg="#97A3B2"
      onClick={onBack}
    />
    <WindowIcon
      icon="ArrowRightLine"
      disabled={!canGoForward}
      iconColor={iconColor}
      bg="#97A3B2"
      onClick={onForward}
    />
    <WindowIcon
      icon="Refresh"
      iconColor={iconColor}
      bg="#97A3B2"
      onClick={onRefresh}
    />
  </Flex>
);
