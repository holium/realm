import React, { FC, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Grid, Text, Flex, Icons, Sigil } from 'renderer/components';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { Row } from 'renderer/components/NewRow';
import { useServices } from 'renderer/logic/store';
import { AvatarRow } from './AvatarRow';
import { rgba, darken } from 'polished';
import { RoomsModelType } from 'os/services/tray/rooms.model';
import { useTrayApps } from 'renderer/apps/store';
import { id } from 'ethers/lib/utils';

type RoomRowProps = Partial<RoomsModelType> & {
  tray?: boolean;
  onClick?: (evt: any) => any;
  rightChildren?: any;
};

export const RoomRow: FC<RoomRowProps> = observer((props: RoomRowProps) => {
  const { id, tray, title, present, creator, cursors, onClick, rightChildren } =
    props;
  const { desktop, ship } = useServices();
  const { roomsApp } = useTrayApps();

  const { mode, dockColor, windowColor } = desktop.theme;

  const bgColor = useMemo(() => darken(0.025, windowColor), [windowColor]);

  let peopleText = 'people';
  if (present!.length === 1) {
    peopleText = 'person';
  }
  // const creator = roomsApp.liveRoom?.creator;
  let peopleNoHost = present!.filter((person: string) => person !== ship?.patp);
  let titleText = title;
  if (titleText!.length > 16 && tray) {
    titleText = titleText!.substring(0, 16) + '...';
  }
  const isLive = roomsApp.liveRoom?.id === id;

  return (
    <Row
      small={tray}
      className="realm-cursor-hover"
      baseBg={!tray && isLive ? bgColor : undefined}
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
          <Text fontWeight={500} fontSize={tray ? '14px' : '15px'}>
            {titleText}
          </Text>
          {!tray && (
            <Flex flexDirection="row">
              {/* {isLive && <Icons mr={1} color="#4E9EFD" name="RoomSpeaker" />} */}
              {/* <Icons mr={1} opacity={0.5} name="Friends" /> */}
              <Text opacity={0.5} fontWeight={400} fontSize={2}>
                {creator === ship!.patp ? 'You' : creator}
                {/* {present!.length} {peopleText}{' '} */}
                {/* {present!.includes(ship!.patp) && ` - (You)`} */}
              </Text>
            </Flex>
          )}
        </Flex>

        <AvatarRow
          people={peopleNoHost}
          backgroundColor={tray ? dockColor : windowColor}
        />
      </Flex>
      {rightChildren || <div />}
    </Row>
  );
});
