import { useMemo, PointerEvent } from 'react';
import styled from 'styled-components';
import { TitlebarContainer } from 'renderer/system/desktop/components/AppWindow/Titlebar/Titlebar.styles';
import { AppWindowIcon } from 'renderer/system/desktop/components/AppWindow/AppWindowIcon';

const ToolbarContainer = styled(TitlebarContainer)`
  padding: 0px 18px;
  height: 60px;
  background: transparent;
  justify-content: flex-end;
  border-bottom: none;
`;

export interface DialogTitlebarProps {
  onDragStart: (e: PointerEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  zIndex: number;
  showDevToolsToggle: boolean;
  onClose?: () => void;
}

export const DialogTitlebar = ({
  onDragEnd,
  onDragStart,
  zIndex,
  onClose,
}: DialogTitlebarProps) => {
  return useMemo(() => {
    return (
      <ToolbarContainer
        hasBlur={false}
        onPointerDown={onDragStart}
        onPointerUp={onDragEnd}
        zIndex={zIndex}
        hasBorder
      >
        {onClose && (
          <AppWindowIcon
            icon="Close"
            size={26}
            iconColor="intent-alert"
            onClick={(evt: any) => {
              evt.stopPropagation();
              onClose && onClose();
            }}
          />
        )}
      </ToolbarContainer>
    );
  }, [onClose, onDragStart, onDragEnd, zIndex]);
};
