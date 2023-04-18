import { Flex } from '@holium/design-system';
import { AppWindowIcon } from 'renderer/system/desktop/components/AppWindow/AppWindowIcon';

type Props = {
  showDevToolsToggle: boolean;
  toggleDevTools: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
};

export const ToolbarControlButtons = ({
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
        onClick={(evt) => {
          evt.stopPropagation();
          toggleDevTools();
        }}
      />
    )}
    <AppWindowIcon
      icon="Minimize"
      onClick={(evt) => {
        evt.stopPropagation();
        onMinimize && onMinimize();
      }}
    />
    <AppWindowIcon
      icon="Expand"
      onClick={(evt) => {
        evt.stopPropagation();
        onMaximize && onMaximize();
      }}
    />
    <AppWindowIcon
      icon="Close"
      iconColor="intent-alert"
      onClick={(evt) => {
        evt.stopPropagation();
        onClose && onClose();
      }}
    />
  </Flex>
);
