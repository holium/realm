import { useEffect } from 'react';
import {
  CursorOutPayload,
  CursorEvent,
  CursorDownPayload,
  CursorUpPayload,
  CursorMovePayload,
  CursorClickPayload,
  TransactionPayload,
  CaretPayload,
} from '@holium/realm-multiplayer';
import { DataPacket_Kind, RoomManagerEvent } from '@holium/realm-room';
import { normalizePosition } from 'os/services/shell/lib/window-manager';
import { useRooms } from 'renderer/apps/Rooms/useRooms';
import { useServices } from 'renderer/logic/store';

export const useMultiplayer = () => {
  const { ship, shell } = useServices();
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

    window.electron.app.onMouseDown(() => {
      const cursorDownPayload: CursorDownPayload = {
        patp: ship.patp,
        event: CursorEvent.Down,
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

    window.electron.multiplayer.onAppToRealmMouseClick((patp, elementId) => {
      const cursorClickPayload: CursorClickPayload = {
        patp,
        elementId,
        event: CursorEvent.Click,
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: cursorClickPayload },
      });
    });

    window.electron.multiplayer.onAppToRealmSendTransaction(
      (patp, version, steps, clientID) => {
        const transactionPayload: TransactionPayload = {
          patp,
          version,
          steps,
          clientID,
          event: CursorEvent.Transaction,
        };
        roomsManager.sendData({
          kind: DataPacket_Kind.DATA,
          value: { transaction: transactionPayload },
        });
      }
    );

    window.electron.multiplayer.onAppToRealmSendCaret((patp, position) => {
      const caretPayload: CaretPayload = {
        patp,
        position,
        event: CursorEvent.Caret,
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { caret: caretPayload },
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
        const cursorPayload = data.value.cursor;
        if (!cursorPayload) return;

        const { event } = cursorPayload;

        if (event === CursorEvent.Move) {
          const { patp, position, state, hexColor } =
            cursorPayload as CursorMovePayload;
          window.electron.multiplayer.mouseMove(
            patp,
            position,
            state,
            hexColor
          );
        } else if (event === CursorEvent.Out) {
          const { patp } = cursorPayload as CursorOutPayload;
          window.electron.multiplayer.mouseOut(patp);
        } else if (event === CursorEvent.Down) {
          const { patp } = cursorPayload as CursorDownPayload;
          window.electron.multiplayer.mouseDown(patp);
        } else if (event === CursorEvent.Up) {
          const { patp } = cursorPayload as CursorUpPayload;
          window.electron.multiplayer.mouseUp(patp);
        } else if (event === CursorEvent.Click) {
          const { patp, elementId } = cursorPayload as CursorClickPayload;
          window.electron.multiplayer.realmToAppMouseClick(patp, elementId);
        }
      }
    );
  }, [ship?.color, ship?.patp]);
};

/**
 * We should not use dispatch if we can use @holium/realm-multiplayer (more reliable).
 * We might need to dispatch for the browser where we can't use realm-multiplayer though.
 */
// const dispatchClickEvent = async (
//   position: Position,
//   desktopDimensions: Dimensions
// ) => {
//   const absolutePosition = denormalizePosition(position, desktopDimensions);
//   const element = document.elementFromPoint(
//     absolutePosition.x,
//     absolutePosition.y
//   );
//   const isMultiplayerWindow = element?.closest('.multiplayer-window');
//   if (element && isMultiplayerWindow) {
//     const isWebView = element.tagName === 'WEBVIEW';
//     if (isWebView) {
//       /* This is unreliable, let's not do it for now. */
//       const webview = element as Electron.WebviewTag;
//       const relativePosition = {
//         x: absolutePosition.x - webview.offsetLeft,
//         y: absolutePosition.y - webview.offsetTop,
//       };
//       try {
//         await webview?.executeJavaScript(`
//           const el = document.elementFromPoint(${relativePosition.x}, ${relativePosition.y});
//           el?.dispatchEvent(new MouseEvent('click', {
//             bubbles: true,
//             cancelable: true,
//           }));
//         `);
//       } catch (error) {
//         console.error('error', error);
//       }
//     } else {
//       const clickEvent = new MouseEvent('click', {
//         bubbles: true,
//         cancelable: true,
//       });
//       element.dispatchEvent(clickEvent);
//     }
//   }
// };
