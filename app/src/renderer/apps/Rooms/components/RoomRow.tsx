import { FC, useMemo, useEffect, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { Text, Flex } from 'renderer/components';
import { Row } from 'renderer/components/NewRow';
import { useServices } from 'renderer/logic/store';
import { AvatarRow } from './AvatarRow';
import { darken } from 'polished';
import { RoomType } from '@holium/realm-room';
import { useRooms } from '../useRooms';
import {
  ContextMenuOption,
  useContextMenu,
} from 'renderer/components/ContextMenu';

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
    // cursors,
    onClick,
    rightChildren,
  } = props;
  const { theme, ship } = useServices();
  const roomsManager = useRooms();
  const { getOptions, setOptions } = useContextMenu();
  const defaultOptions = getOptions().filter((o) => o.id === 'toggle-devtools');

  const { mode, dockColor, windowColor } = theme.currentTheme;

  // TODO do light and dark mode coloring
  const bgColor = useMemo(() => darken(0.025, windowColor), [windowColor]);
  const isLiveColor = useMemo(() => darken(0.02, bgColor), [bgColor]);

  const presentCount = roomsManager.protocol.peers.size + 1; // to include self
  let peopleText = 'people';
  if (presentCount === 1) {
    peopleText = 'person';
  }
  const peopleNoHost = present!.filter(
    (person: string) => person !== ship?.patp
  );
  let titleText = title;
  if (titleText!.length > 16 && tray) {
    titleText = titleText!.substring(0, 16) + '...';
  }
  const isLive = roomsManager.presentRoom?.rid === rid;

  const contextMenuOptions = useMemo(
    () =>
      ship!.patp === props.provider
        ? [
            {
              id: `room-delete-${rid}`,
              label: 'Delete Room',
              onClick: (evt) => {
                evt.stopPropagation();
                roomsManager.protocol.deleteRoom(rid);
              },
            } as ContextMenuOption,
            ...defaultOptions,
          ]
        : defaultOptions,
    [rid, ship, props.provider]
  );

  useEffect(() => {
    if (
      contextMenuOptions.length &&
      contextMenuOptions !== getOptions(`room-row-${rid}`)
    ) {
      setOptions(`room-row-${rid}`, contextMenuOptions);
    }
  }, [contextMenuOptions, rid, setOptions]);

  return (
    <Row
      small={tray}
      className="realm-cursor-hover"
      baseBg={!tray && isLive ? isLiveColor : undefined}
      customBg={isLive ? bgColor : windowColor}
      onClick={(evt: MouseEvent<HTMLDivElement>) => onClick?.(evt)}
      style={
        !onClick
          ? { pointerEvents: 'none', position: 'relative' }
          : { position: 'relative' }
      }
    >
      <Flex
        flex={1}
        gap={16}
        justifyContent="space-between"
        alignItems="center"
        flexDirection="row"
      >
        <Flex width="-webkit-fill-available" gap={2} flexDirection="column">
          {/* An absolute element that captures all the context clicks */}
          <div
            id={`room-row-${rid}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
            }}
          />
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
