import styled from 'styled-components';

import { Box, Flex, Icon, Text, Tooltip } from '@holium/design-system/general';

const ControlRow = styled.div`
  z-index: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px;
  border-radius: 16px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  .video-pin-btn {
    opacity: 0;
    transition: var(--transition);
  }
  &:hover {
    .video-pin-btn {
      opacity: 1;
      transition: var(--transition);
    }
  }
`;

const VideoWrapper = styled.div`
  position: relative;
  top: -50%;
  left: -50%;
  transform: translate(50%, 50%);
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: none;
  border-radius: 9px;
  background: #000;
  ${ControlRow} {
    opacity: 0;
    transition: var(--transition);
  }
  &:hover {
    ${ControlRow} {
      opacity: 1;
      transition: var(--transition);
    }
  }
`;

type Props = {
  id: string;
  canPin: boolean;
  isPinned: boolean;
  innerRef: React.RefObject<HTMLVideoElement>;
  onPin?: () => void;
};

export const Video = ({ id, innerRef, isPinned, canPin, onPin }: Props) => (
  <VideoWrapper id={`${id}-wrapper`}>
    <ControlRow style={{ display: canPin ? 'flex' : 'none' }}>
      <Flex col align="center" gap={4}>
        <Tooltip
          id={`${id}-button`}
          content={
            isPinned ? (
              <Text.Custom style={{ color: '#ffffff80' }}>Unpin</Text.Custom>
            ) : (
              <Text.Custom style={{ color: '#ffffff80' }}>Pin</Text.Custom>
            )
          }
          placement="bottom"
          wrapperStyle={{
            zIndex: 10,
          }}
        >
          <Box
            onClick={(_evt: any) => onPin && onPin()}
            style={{ cursor: 'pointer' }}
          >
            <Icon
              size={28}
              name={isPinned ? 'Unpin' : 'Pin'}
              style={{ fill: '#ffffff80' }}
            />
          </Box>
        </Tooltip>
      </Flex>
    </ControlRow>
    <video
      id={id}
      ref={innerRef}
      style={{
        zIndex: 0,
        display: 'none',
        position: 'absolute',
        pointerEvents: 'none',
        top: '-50%',
        left: '-50%',
        transform: 'translate(50%, 50%)',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        background: 'black',
      }}
      autoPlay
      playsInline
      muted
    />
  </VideoWrapper>
);
