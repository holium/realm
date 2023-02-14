import { Flex } from 'renderer/components';
import { AppWindowIcon } from 'renderer/system/desktop/components/AppWindow/AppWindowIcon';

type Props = {
  iconColor: string;
  showDevToolsToggle: boolean;
  toggleDevTools: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
};

export const ToolbarControlButtons = ({
  iconColor,
  showDevToolsToggle,
  toggleDevTools,
  onClose,
  onMinimize,
  onMaximize,
}: Props) => (
  <Flex gap={4}>
    {showDevToolsToggle && (
      <AppWindowIcon
        icon="DevBox"
        iconColor={iconColor}
        bg="#97A3B2"
        onClick={(evt) => {
          evt.stopPropagation();
          toggleDevTools();
        }}
      />
    )}
    <AppWindowIcon
      icon="Minimize"
      iconColor={iconColor}
      bg="#97A3B2"
      onClick={(evt) => {
        evt.stopPropagation();
        onMinimize && onMinimize();
      }}
    />
    <AppWindowIcon
      icon="Expand"
      iconColor={iconColor}
      bg="#97A3B2"
      onClick={(evt) => {
        evt.stopPropagation();
        onMaximize && onMaximize();
      }}
    />
    <AppWindowIcon
      icon="Close"
      iconColor={iconColor}
      bg="#FF6240"
      fillWithBg
      onClick={(evt) => {
        evt.stopPropagation();
        onClose && onClose();
      }}
    />
  </Flex>
);
