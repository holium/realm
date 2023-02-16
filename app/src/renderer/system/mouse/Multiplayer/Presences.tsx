import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import {
  CursorMovePayload,
  CursorEvent,
  Ship,
  useRealmMultiplayer,
} from '@holium/realm-multiplayer';
import { hexToRgb, rgbToString } from '../../../../os/lib/color';
import { AnimatedCursor } from '../AnimatedCursor';

interface CursorState extends Omit<CursorMovePayload, 'event' | 'id'> {
  isClicking?: boolean;
}

// Manage websocket connection within realm or an individual app
export const Presences = () => {
  const { api } = useRealmMultiplayer();
  const [cursors, setCursors] = useState<Record<string, CursorState>>({});
  const [ships, setShips] = useState<Record<string, Ship>>({});

  // Update cursors for other cursors
  useEffect(() => {
    console.log('connecting');
    if (!api) return;
    api.subscribe<CursorMovePayload>(CursorEvent.Move, (payload) => {
      console.log('move', payload);
      setCursors((prev) => {
        return { ...prev, [payload.id]: payload };
      });
    });

    return () => api.close();
  }, []);

  return (
    <>
      {Object.entries(cursors).map(([id, { position, isClicking }]) => {
        const ship = ships[id];
        if (!ship) return null;
        const { patp, color } = ship;

        return (
          <div key={id}>
            <AnimatedCursor
              color={color && rgbToString(hexToRgb(color))}
              coords={position}
              isVisible={true}
              isActive={isClicking ?? false}
              isActiveClickable={isClicking}
              state="pointer"
            />
            <CursorName
              style={{
                x: position.x,
                y: position.y,
                backgroundColor: color || '0,0,0',
                color: 'white',
              }}
            >
              {patp}
            </CursorName>
          </div>
        );
      })}
    </>
  );
};

const CursorName = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 6px;
  padding: 2px 4px;
  pointer-events: none;
  font-family: 'Rubik', sans-serif;
`;
