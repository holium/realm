import { FC, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Icon } from '@holium/design-system';
import { IconButton } from 'renderer/components';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { nativeApps } from '../nativeApps';
import { AppType } from 'os/services/spaces/models/bazaar';

const ICON_SIZE = 28;

export type CommandPaletteIconProps = {
  iconName: string;
  color: string;
};

export const CommandPaletteIcon: FC<CommandPaletteIconProps> = observer(
  (props: CommandPaletteIconProps) => {
    const onButtonDragStart = useCallback(
      (evt: any) => {
        evt.preventDefault();
        window.addEventListener('mouseup', onButtonDragEnd);
        const iconEvent = new CustomEvent('icon');
        window.dispatchEvent(iconEvent);
      },
      []
      /*[activeApp, anchorOffset, position, dimensions]*/
    );

    const onButtonDragEnd = useCallback(
      (evt: any) => {
        evt.preventDefault();
        const iconEvent = new CustomEvent('icon', {
          detail: null,
        });
        window.dispatchEvent(iconEvent);
        window.removeEventListener('mouseup', onButtonDragEnd);
        DesktopActions.openAppWindow(nativeApps['airlift'] as AppType);
      },
      []
      /*[activeApp, anchorOffset, position, dimensions]*/
    );
    return (
      <IconButton
        id="airlift-tray-icon"
        size={ICON_SIZE}
        mt="2px"
        draggable={true}
        onDragStart={onButtonDragStart}
        color={props.color}
        // mb="-2px"
      >
        <Icon name={props.iconName} size={ICON_SIZE} />
      </IconButton>
    );
  }
);
