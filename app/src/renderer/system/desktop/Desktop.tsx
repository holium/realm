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
import { normalizePosition } from '../../../os/services/shell/lib/window-manager';
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
  const roomsManager = useRooms(ship?.patp);

  useEffect(() => {
    if (!ship) return;

    window.electron.app.onMouseOut(() => {
      const cursorOutPayload: CursorOutPayload = {
        patp: ship.patp,
        event: CursorEvent.Out,
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: cursorOutPayload },
      });
    });

    window.electron.app.onMouseDown((position, elementId) => {
      const cursorDownPayload: CursorDownPayload = {
        patp: ship.patp,
        elementId,
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
        patp: ship.patp,
        event: CursorEvent.Up,
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: cursorUpPayload },
      });
    });

    window.electron.app.onMouseMove((position, state) => {
      const cursorMovePayload: CursorMovePayload = {
        patp: ship.patp,
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

    window.electron.app.onMultiplayerClickFromApp((patp, elementId) => {
      const cursorDownPayload: CursorDownPayload = {
        patp,
        elementId,
        event: CursorEvent.Down,
        position: { x: 0, y: 0 },
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: cursorDownPayload },
      });
    });

    roomsManager.on(RoomManagerEvent.LeftRoom, (_, patp) => {
      const cursorOutPayload: CursorOutPayload = {
        patp,
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
          const { patp, position, state, hexColor } =
            cursorPayload as CursorMovePayload;
          window.electron.app.multiplayerMouseMove(
            patp,
            position,
            state,
            hexColor
          );
        } else if (event === CursorEvent.Out) {
          const { patp } = cursorPayload as CursorOutPayload;
          window.electron.app.multiplayerMouseOut(patp);
        } else if (event === CursorEvent.Down) {
          const { patp, elementId } = cursorPayload as CursorDownPayload;
          window.electron.app.multiplayerMouseDown(patp, elementId);
          /**
           * We should not use dispatch if we can use @holium/realm-multiplayer (more reliable).
           * Althought we might need to dispatch for the browser where we can't use realm-multiplayer.
           */
          // const absolutePosition = denormalizePosition(
          //   position,
          //   shell.desktopDimensions
          // );
          // const element = document.elementFromPoint(
          //   absolutePosition.x,
          //   absolutePosition.y
          // );
          // const isMultiplayerWindow = element?.closest('.multiplayer-window');
          // if (element && isMultiplayerWindow) {
          //   const isWebView = element.tagName === 'WEBVIEW';
          //   if (isWebView) {
          //     /* This is unreliable, let's not do it for now. */
          //     // const webview = element as Electron.WebviewTag;
          //     // const relativePosition = {
          //     //   x: absolutePosition.x - webview.offsetLeft,
          //     //   y: absolutePosition.y - webview.offsetTop,
          //     // };
          //     // try {
          //     //   await webview?.executeJavaScript(`
          //     //     const el = document.elementFromPoint(${relativePosition.x}, ${relativePosition.y});
          //     //     el?.dispatchEvent(new MouseEvent('click', {
          //     //       bubbles: true,
          //     //       cancelable: true,
          //     //     }));
          //     //   `);
          //     // } catch (error) {
          //     //   console.error('error', error);
          //     // }
          //   } else {
          //     const clickEvent = new MouseEvent('click', {
          //       bubbles: true,
          //       cancelable: true,
          //     });
          //     element.dispatchEvent(clickEvent);
          //   }
          // }
        } else if (event === CursorEvent.Up) {
          const { patp } = cursorPayload as CursorUpPayload;
          window.electron.app.multiplayerMouseUp(patp);
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
