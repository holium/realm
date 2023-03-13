import { useEffect, useState } from 'react';
import { Position } from 'os/types';
import { AnimatedCursor } from './AnimatedCursor';
import { hexToRgb, rgbToString } from 'os/lib/color';
import { MouseState } from '@holium/realm-presence';
import { useToggle } from 'renderer/logic/lib/useToggle';
import { CursorLabel, EphemeralChat } from './Mouse.styles';

type CursorState = Record<
  string,
  {
    color: string;
    state: MouseState;
    position: Position;
    isActive: boolean;
    isVisible: boolean;
    mouseOutTimeoutRef: NodeJS.Timeout;
    chat?: string;
  }
>;

// Manage websocket connection within realm or an individual app
export const MultiplayerMice = () => {
  const enabled = useToggle(true);
  const [cursors, setCursors] = useState<CursorState>({});

  useEffect(() => {
    window.electron.multiplayer.onMouseOut((patp) => {
      // We don't want to hide the cursor immediately because
      // mouseout can be called when moving between contexts (e.g. webviews).
      const timeOutRef = setTimeout(() => {
        setCursors((prev) => ({
          ...prev,
          [patp]: {
            ...prev[patp],
            isVisible: false,
          },
        }));
      }, 100);

      setCursors((prev) => ({
        ...prev,
        [patp]: {
          ...prev[patp],
          mouseOutTimeoutRef: timeOutRef,
        },
      }));
    });
    window.electron.multiplayer.onMouseMove(
      (patp, position, state, hexColor) => {
        const color = rgbToString(hexToRgb(hexColor)) ?? '0, 0, 0';
        setCursors((prev) => {
          if (prev[patp]?.mouseOutTimeoutRef) {
            clearTimeout(prev[patp].mouseOutTimeoutRef);
          }

          return {
            ...prev,
            [patp]: {
              ...prev[patp],
              isVisible: true,
              state,
              position,
              color,
            },
          };
        });
      }
    );
    window.electron.multiplayer.onMouseDown((patp) => {
      setCursors((prev) => ({
        ...prev,
        [patp]: {
          ...prev[patp],
          isActive: true,
        },
      }));
    });
    window.electron.multiplayer.onMouseUp((patp) => {
      setCursors((prev) => ({
        ...prev,
        [patp]: {
          ...prev[patp],
          isActive: false,
        },
      }));
    });
    window.electron.multiplayer.onToggleMultiplayer(enabled.toggle);
    window.electron.multiplayer.onRealmToAppSendChat((patp, message) => {
      setCursors((prev) => ({
        ...prev,
        [patp]: {
          ...prev[patp],
          chat: message,
        },
      }));
    });
  }, []);

  const visibleCursors = Object.entries(cursors).filter(
    ([, { position, isVisible }]) => position && isVisible
  );

  if (visibleCursors.length < 1) return null;

  if (!enabled.isOn) return null;

  return (
    <>
      {visibleCursors.map(
        ([patp, { state, position, isActive, isVisible, color, chat }]) => (
          <div key={`${patp}-cursor`}>
            <AnimatedCursor
              color={color}
              state={state}
              position={position}
              isActive={isActive}
              isVisible={isVisible}
            />
            {chat ? (
              <EphemeralChat position={position} color={color}>
                {chat}
              </EphemeralChat>
            ) : (
              <CursorLabel color={color} position={position}>
                {patp}
              </CursorLabel>
            )}
          </div>
        )
      )}
    </>
  );
};
