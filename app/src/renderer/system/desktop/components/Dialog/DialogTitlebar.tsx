import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { rgba } from 'polished';
import { TitlebarStyle } from 'renderer/system/desktop/components/AppWindow/Titlebar';
import { Flex, Icons, Input, Spinner } from 'renderer/components';
import { WindowIcon } from 'renderer/system/desktop/components/AppWindow/WindowIcon';
import { useServices } from 'renderer/logic/store';

const ToolbarStyle = styled(TitlebarStyle)`
  padding: 0px 18px;
  height: 60px;
  background: transparent;
  justify-content: flex-end;
  border-bottom: none;
`;

export type DialogTitlebarProps = {
  dragControls: any;
  onDragStart: any;
  onDragStop: any;
  zIndex: number;
  showDevToolsToggle: boolean;
  windowColor: string;
  onClose?: () => void;
  onMaximize: () => void;
};

export const DialogTitlebar: FC<DialogTitlebarProps> = (
  props: DialogTitlebarProps
) => {
  const {
    dragControls,
    onDragStop,
    onDragStart,
    zIndex,
    windowColor,
    onClose,
  } = props;
  const { shell } = useServices();
  const { desktop, theme } = shell;

  const { iconColor } = desktop.theme;

  return useMemo(() => {
    return (
      <ToolbarStyle
        hasBlur={false}
        {...(dragControls
          ? {
              onPointerDown: (e) => {
                dragControls.start(e);
                onDragStart && onDragStart(e);
              },
              onPointerUp: (e) => {
                onDragStop && onDragStop(e);
              },
            }
          : {})}
        zIndex={zIndex}
        customBg={windowColor!}
        hasBorder
      >
        {onClose && (
          <WindowIcon
            icon="Close"
            size={26}
            iconColor={iconColor!}
            bg="#FF6240"
            fillWithBg
            onClick={(evt: any) => {
              evt.stopPropagation();
              onClose && onClose();
            }}
          />
        )}
      </ToolbarStyle>
    );
  }, [zIndex, iconColor, windowColor]);
};
