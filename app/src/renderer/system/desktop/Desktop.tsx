import { useEffect } from 'react';
import { observer } from 'mobx-react';
import { Bottom, Layer, Fill } from 'react-spaces';
import { SystemBar } from './components/SystemBar/SystemBar';
import { AppWindowManager } from './AppWindowManager';
import { HomePane } from './components/Home/HomePane';
import { useServices } from 'renderer/logic/store';
import { TrayManager } from './TrayManager';
import { useRooms } from 'renderer/apps/Rooms/useRooms';
import { DataPacket_Kind, RoomManagerEvent } from '@holium/realm-room';
import {
  normalizePosition,
  denormalizePosition,
} from '../../../os/services/shell/lib/window-manager';
import {
  CursorDownPayload,
  CursorEvent,
  CursorMovePayload,
  CursorOutPayload,
  CursorPayload,
  CursorUpPayload,
} from '@holium/realm-multiplayer';

const DesktopPresenter = () => {
  const { ship, desktop, shell } = useServices();
  const roomsManager = useRooms(ship?.patp); // creates first instance of roomsManager

  useEffect(() => {
    if (!ship) return;

    window.electron.app.onMouseOut(() => {
      const cursorOutPayload: CursorOutPayload = {
        id: ship.patp,
        event: CursorEvent.Out,
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: cursorOutPayload },
      });
    });

    window.electron.app.onMouseDown((position) => {
      const cursorDownPayload: CursorDownPayload = {
        id: ship.patp,
        event: CursorEvent.Down,
        position: normalizePosition(position, shell.desktopDimensions),
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: {
          cursor: cursorDownPayload,
        },
      });
    });

    window.electron.app.onMouseUp(() => {
      const cursorUpPayload: CursorUpPayload = {
        id: ship.patp,
        event: CursorEvent.Up,
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: cursorUpPayload },
      });
    });

    window.electron.app.onMouseMove((position, state) => {
      const cursorMovePayload: CursorMovePayload = {
        id: ship.patp,
        event: CursorEvent.Move,
        position: normalizePosition(position, shell.desktopDimensions),
        state,
        hexColor: ship.color ?? '#000000',
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: cursorMovePayload },
      });
    });

    roomsManager.on(RoomManagerEvent.LeftRoom, (_, patp) => {
      const cursorOutPayload: CursorOutPayload = {
        id: patp,
        event: CursorEvent.Out,
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: cursorOutPayload },
      });
    });

    roomsManager.on(
      RoomManagerEvent.OnDataChannel,
      async (_rid: string, _peer: string, data) => {
        const cursorPayload = data.value.cursor as CursorPayload | undefined;

        if (!cursorPayload) return;

        const { event } = cursorPayload;

        if (event === CursorEvent.Move) {
          const { id, position, state, hexColor } =
            cursorPayload as CursorMovePayload;
          window.electron.app.multiplayerMouseMove(
            id,
            position,
            state,
            hexColor
          );
        } else if (event === CursorEvent.Out) {
          const { id } = cursorPayload as CursorOutPayload;
          window.electron.app.multiplayerMouseOut(id);
        } else if (event === CursorEvent.Down) {
          const { id, position } = cursorPayload as CursorDownPayload;
          window.electron.app.multiplayerMouseDown(id);

          const absolutePosition = denormalizePosition(
            position,
            shell.desktopDimensions
          );
          const element = document.elementFromPoint(
            absolutePosition.x,
            absolutePosition.y
          );
          const isMultiplayerWindow = element?.closest('.multiplayer-window');

          if (element && isMultiplayerWindow) {
            const isWebView = element.tagName === 'WEBVIEW';

            if (isWebView) {
              /* This is unreliable, let's not do it for now. */
              // const webview = element as Electron.WebviewTag;
              // const relativePosition = {
              //   x: absolutePosition.x - webview.offsetLeft,
              //   y: absolutePosition.y - webview.offsetTop,
              // };
              // try {
              //   await webview?.executeJavaScript(`
              //     const el = document.elementFromPoint(${relativePosition.x}, ${relativePosition.y});
              //     el?.dispatchEvent(new MouseEvent('click', {
              //       bubbles: true,
              //       cancelable: true,
              //     }));
              //   `);
              // } catch (error) {
              //   console.error('error', error);
              // }
            } else {
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
              });
              element.dispatchEvent(clickEvent);
            }
          }
        } else if (event === CursorEvent.Up) {
          const { id } = cursorPayload as CursorUpPayload;
          window.electron.app.multiplayerMouseUp(id);
        }
      }
    );
  }, [ship?.color, ship?.patp]);

  return (
    <Fill>
      <Layer zIndex={15}>
        <TrayManager />
      </Layer>
      <Layer zIndex={0}>
        <AppWindowManager />
      </Layer>
      <Layer zIndex={1}>{desktop.isHomePaneOpen && <HomePane />}</Layer>
      <Layer zIndex={14}>
        <Bottom size={56}>
          <SystemBar />
        </Bottom>
      </Layer>
    </Fill>
  );
};

export const Desktop = observer(DesktopPresenter);
