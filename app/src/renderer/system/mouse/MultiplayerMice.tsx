import { useCallback, useEffect, useState } from 'react';

import { hexToRgb, Position, rgbToString } from '@holium/design-system/util';
import { MouseState } from '@holium/realm-presence';

import { AnimatedCursor } from './AnimatedCursor';
import { CursorLabel, EphemeralChat } from './Mouse.styles';

const CURSOR_TIMEOUT = 5000;

type CursorState = Record<
  string,
  {
    color: string;
    state: MouseState;
    position: Position;
    isActive: boolean;
    isVisible: boolean;
    timeout?: NodeJS.Timeout;
    chat?: string;
  }
>;

export const MultiplayerMice = () => {
  const [cursors, setCursors] = useState<CursorState>({});

  const setNewTimeout = useCallback((patp: string) => {
    const timeout = setTimeout(() => {
      setCursors((prev) => ({
        ...prev,
        [patp]: {
          ...prev[patp],
          isVisible: false,
        },
      }));
    }, CURSOR_TIMEOUT);

    return timeout;
  }, []);

  useEffect(() => {
    window.electron.multiplayer.onMouseOut((patp) => {
      setCursors((prev) => ({
        ...prev,
        [patp]: {
          ...prev[patp],
          isVisible: false,
        },
      }));
    });
    window.electron.multiplayer.onMouseMove(
      (patp, position, state, hexColor) => {
        const color = rgbToString(hexToRgb(hexColor)) ?? '0, 0, 0';
        setCursors((prev) => {
          if (prev[patp] && prev[patp].timeout) {
            const { timeout } = prev[patp];
            if (timeout) {
              clearTimeout(timeout);
            }
          }

          const timeout = setNewTimeout(patp);

          return {
            ...prev,
            [patp]: {
              ...prev[patp],
              isVisible: true,
              timeout: timeout,
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
    window.electron.multiplayer.onRealmToAppSendChat((patp, message) => {
      setCursors((prev) => {
        if (prev[patp] && prev[patp].timeout) {
          const { timeout } = prev[patp];
          if (timeout) {
            clearTimeout(timeout);
          }
        }

        const timeout = setNewTimeout(patp);

        return {
          ...prev,
          [patp]: {
            ...prev[patp],
            chat: message,
            timeout: timeout,
          },
        };
      });
    });
  }, []);

  const visibleCursors = Object.entries(cursors).filter(
    ([, { position, isVisible }]) => position && isVisible
  );

  if (visibleCursors.length < 1) return null;

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
