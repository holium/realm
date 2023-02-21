import { useMemo } from 'react';
import styled from 'styled-components';
import { TitlebarContainer } from 'renderer/system/desktop/components/AppWindow/Titlebar/Titlebar.styles';
import { AppWindowIcon } from 'renderer/system/desktop/components/AppWindow/AppWindowIcon';
import { useServices } from 'renderer/logic/store';

const ToolbarContainer = styled(TitlebarContainer)`
  padding: 0px 18px;
  height: 60px;
  background: transparent;
  justify-content: flex-end;
  border-bottom: none;
`;

export interface DialogTitlebarProps {
  dragControls: any;
  onDragStart: any;
  onDragStop: any;
  zIndex: number;
  showDevToolsToggle: boolean;
  windowColor: string;
  onClose?: () => void;
}

export const DialogTitlebar = ({
  dragControls,
  onDragStop,
  onDragStart,
  zIndex,
  windowColor,
  onClose,
}: DialogTitlebarProps) => {
  const { theme } = useServices();

  const { iconColor } = theme.currentTheme;

  return useMemo(() => {
    return (
      <ToolbarContainer
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
        hasBorder
      >
        {onClose && (
          <AppWindowIcon
            icon="Close"
            size={26}
            iconColor={iconColor}
            bg="#FF6240"
            fillWithBg
            onClick={(evt: any) => {
              evt.stopPropagation();
              onClose && onClose();
            }}
          />
        )}
      </ToolbarContainer>
    );
  }, [zIndex, iconColor, windowColor]);
};
