import { useEffect, useState } from 'react';
import { Position } from 'os/types';
import { AnimatedCursor } from './AnimatedCursor';
import { hexToRgb, rgbToString } from 'os/lib/color';
import { MouseState } from '@holium/realm-presence';
import { CursorLabel, EphemeralChat } from './Mouse.styles';

type CursorState = Record<
  string,
  {
    color: string;
    state: MouseState;
    position: Position;
    isActive: boolean;
    isVisible: boolean;
    chat?: string;
  }
>;

export const MultiplayerMice = () => {
  const [cursors, setCursors] = useState<CursorState>({});

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
        setCursors((prev) => ({
          ...prev,
          [patp]: {
            ...prev[patp],
            isVisible: true,
            state,
            position,
            color,
          },
        }));
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