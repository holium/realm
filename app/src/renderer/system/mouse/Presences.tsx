import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { MouseState } from '@holium/realm-presence';
import { Position } from 'os/types';
import { AnimatedCursor } from './AnimatedCursor';
import { bgIsLightOrDark, hexToRgb, rgbToString } from 'os/lib/color';

type CursorState = Record<
  string,
  {
    color: string;
    state: MouseState;
    position: Position;
    isActive: boolean;
    isVisible: boolean;
    mouseOutTimeoutRef: NodeJS.Timeout;
  }
>;

// Manage websocket connection within realm or an individual app
export const Presences = () => {
  const [cursors, setCursors] = useState<CursorState>({});

  useEffect(() => {
    window.electron.app.onPlayerMouseOut((patp) => {
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

    window.electron.app.onPlayerMouseMove((patp, position, state, hexColor) => {
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
    });
    window.electron.app.onPlayerMouseDown((patp) => {
      setCursors((prev) => ({
        ...prev,
        [patp]: {
          ...prev[patp],
          isActive: true,
        },
      }));
    });
    window.electron.app.onPlayerMouseUp((patp) => {
      setCursors((prev) => ({
        ...prev,
        [patp]: {
          ...prev[patp],
          isActive: false,
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
        ([patp, { state, position, isActive, isVisible, color }]) => (
          <div key={`${patp}-cursor`}>
            <AnimatedCursor
              color={color}
              state={state}
              position={position}
              isActive={isActive}
              isVisible={isVisible}
            />
            <CursorLabel color={color} position={position}>
              {patp}
            </CursorLabel>
          </div>
        )
      )}
    </>
  );
};

type CursorLabelProps = {
  position: Position;
  color: string;
  children: string;
};

const CursorLabel = styled(motion.div)<CursorLabelProps>`
  position: absolute;
  top: ${(props) => props.position.y}px;
  left: ${(props) => props.position.x}px;
  color: ${(props) => bgIsLightOrDark(props.color) === 'dark' && 'white'};
  background-color: ${(props) => `rgba(${props.color}, 0.5)`};
  border-radius: 6px;
  padding: 2px 4px;
  pointer-events: none;
  font-family: 'Rubik', sans-serif;
`;
