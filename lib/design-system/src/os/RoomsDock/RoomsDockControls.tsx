import { Flex } from '../../general/Flex/Flex';
import { Icon } from '../../general/Icon/Icon';
import { Tooltip } from '../../general/Tooltip/Tooltip';
import { BarButton } from '../SystemBar/BarButton';

type Props = {
  live: any;
  isMuted: boolean;
  hasMicPermissions: boolean;
  onMute: (muted: boolean) => void;
};

export const RoomsDockControls = ({
  live,
  isMuted,
  hasMicPermissions,
  onMute,
}: Props) => {
  if (!hasMicPermissions) {
    return (
      <Tooltip
        id="rooms-no-mic-permissions"
        content="No mic permissions"
        placement="top"
      >
        <Flex width={28} height={28} align="center" justify="center">
          <Icon name="InfoCircle" fill="intent-alert" size={20} />
        </Flex>
      </Tooltip>
    );
  }

  if (!live || live.rtype === 'background') return null;

  return (
    <BarButton
      height={28}
      width={28}
      onFocus={(evt) => {
        evt.preventDefault();
        evt.stopPropagation();
      }}
      onClick={(evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        onMute(!isMuted);
      }}
    >
      <Icon
        fill={isMuted ? 'intent-caution' : 'text'}
        name={isMuted ? 'Unmute' : 'Mute'}
        size={26}
      />
    </BarButton>
  );
};
