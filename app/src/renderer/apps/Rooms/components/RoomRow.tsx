import React, { FC, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Text, Flex } from 'renderer/components';
import { Row } from 'renderer/components/NewRow';
import { useServices } from 'renderer/logic/store';
import { AvatarRow } from './AvatarRow';
import { darken } from 'polished';
import { useTrayApps } from 'renderer/apps/store';
// import { id } from 'ethers/lib/utils';
import { RoomType } from '@holium/realm-room';
import { useRooms } from '../useRooms';

type RoomRowProps = Partial<RoomType> & {
  tray?: boolean;
  onClick?: (evt: any) => any;
  rightChildren?: any;
};

export const RoomRow: FC<RoomRowProps> = observer((props: RoomRowProps) => {
  const {
    rid,
    tray,
    title,
    present,
    creator,
    provider,
    // cursors,
    onClick,
    rightChildren,
  } = props;
  const { theme, ship } = useServices();
  const roomsManager = useRooms();
  const { roomsApp } = useTrayApps();

  const { mode, dockColor, windowColor, accentColor } = theme.currentTheme;

  // TODO do light and dark mode coloring
  const bgColor = useMemo(() => darken(0.025, windowColor), [windowColor]);
  const isLiveColor = useMemo(() => darken(0.02, bgColor), [bgColor]);

  const presentCount = roomsManager.protocol.peers.size + 1; // to include self
  let peopleText = 'people';
  if (presentCount === 1) {
    peopleText = 'person';
  }
  // const creator = roomsApp.liveRoom?.creator;
  const peopleNoHost = present!.filter(
    (person: string) => person !== ship?.patp
  );
  let titleText = title;
  if (titleText!.length > 16 && tray) {
    titleText = titleText!.substring(0, 16) + '...';
  }
  const isLive = roomsManager.presentRoom?.rid === rid;

  return (
    <Row
      small={tray}
      className="realm-cursor-hover"
      baseBg={!tray && isLive ? isLiveColor : undefined}
      customBg={isLive ? bgColor : windowColor}
      {...(onClick
        ? { onClick: (evt: any) => onClick(evt) }
        : { style: { pointerEvents: 'none' } })}
    >
      <Flex
        flex={1}
        gap={16}
        justifyContent="space-between"
        alignItems="center"
        flexDirection="row"
      >
        <Flex width="-webkit-fill-available" gap={2} flexDirection="column">
          {/* {(!tray && isLive) && <Icons name='CheckCircle'></Icons> */}
          <Text fontWeight={500} fontSize={tray ? '14px' : '15px'}>
            {titleText}
          </Text>
          {!tray && (
            <Flex flexDirection="row">
              {/* {isLive && <Icons mr={1} color="#4E9EFD" name="RoomSpeaker" />} */}
              {/* <Icons mr={1} opacity={0.5} name="Friends" /> */}
              <Text opacity={0.5} fontWeight={400} fontSize={2}>
                {presentCount} {peopleText}{' '}
                {/* {present!.includes(ship!.patp) && ` - (You)`} */}
              </Text>
              {creator === ship!.patp && (
                <>
                  <Text mx="6px" fontSize={2} fontWeight={200} opacity={0.5}>
                    •
                  </Text>
                  <Text opacity={0.5} fontWeight={200} fontSize={2}>
                    Host
                  </Text>
                </>
              )}
            </Flex>
          )}
        </Flex>

        <AvatarRow
          people={peopleNoHost}
          backgroundColor={tray ? dockColor : windowColor}
        />
      </Flex>
      {/* room deletion button */}
      {/* {tray !== true && (creator === ship!.patp || provider === ship!.patp) && (
        <IconButton
          size={26}
          customBg={bgColor}
          onClick={(evt: any) => {
            evt.stopPropagation();
            // RoomsActions.deleteRoom(id!);
            // if (roomsApp.liveRoom && id! === roomsApp.liveRoom.id) {
            //   LiveRoom.leave();
            // }
          }}
        >
          <Icons name="Trash" />
        </IconButton>
      )} */}
      {rightChildren || <div />}
    </Row>
  );
});
