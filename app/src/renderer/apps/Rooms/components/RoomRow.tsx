import { useMemo, useEffect, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { Row, Text, Flex } from '@holium/design-system';
import { AvatarRow } from './AvatarRow';
import { RoomType } from '@holium/realm-room';
import { useRooms } from '../useRooms';
import {
  ContextMenuOption,
  useContextMenu,
} from 'renderer/components/ContextMenu';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

type RoomRowProps = Partial<RoomType> & {
  tray?: boolean;
  onClick?: (evt: any) => any;
  rightChildren?: any;
};

const RoomRowPresenter = ({
  rid,
  tray,
  title,
  provider,
  present,
  creator,
  onClick,
  rightChildren,
}: RoomRowProps) => {
  const { theme } = useAppState();
  const { ship } = useShipStore();
  const roomsManager = useRooms(ship?.patp);
  const { getOptions, setOptions } = useContextMenu();
  const defaultOptions = getOptions('').filter(
    (o) => o.id === 'toggle-devtools'
  );

  const { dockColor, windowColor } = theme;

  let presentCount = present?.length ?? 0;
  let peopleText = 'people';
  if (presentCount === 1) {
    peopleText = 'person';
  }
  const peopleNoHost = present?.filter(
    (person: string) => person !== ship?.patp
  );
  let titleText = title;
  if (titleText && titleText.length > 16 && tray) {
    titleText = titleText.substring(0, 16) + '...';
  }
  const isLive = roomsManager.presentRoom?.rid === rid;

  const contextMenuOptions = useMemo(
    () =>
      ship?.patp === provider
        ? [
            {
              id: `room-delete-${rid}`,
              label: 'Delete Room',
              onClick: (evt) => {
                evt.stopPropagation();
                rid && roomsManager.protocol.deleteRoom(rid);
              },
            } as ContextMenuOption,
            ...defaultOptions,
          ]
        : defaultOptions,
    [rid, ship, provider]
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
      id={`room-row-${rid}`}
      small={tray}
      className="realm-cursor-hover"
      selected={isLive}
      // baseBg={!tray && isLive ? isLiveColor : undefined}
      onClick={(evt: MouseEvent<HTMLDivElement>) => onClick?.(evt)}
      style={
        !onClick
          ? { pointerEvents: 'none', position: 'relative' }
          : {
              position: 'relative',
            }
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
          <Text.Custom fontWeight={500} fontSize={tray ? '14px' : '15px'}>
            {titleText}
          </Text.Custom>
          {!tray && (
            <Flex flexDirection="row">
              {/* {isLive && <Icons mr={1} color="#4E9EFD" name="RoomSpeaker" />} */}
              {/* <Icons mr={1} opacity={0.5} name="Friends" /> */}
              <Text.Custom opacity={0.5} fontWeight={400} fontSize={2}>
                {presentCount} {peopleText}{' '}
                {/* {present.includes(ship.patp) && ` - (You)`} */}
              </Text.Custom>
              {creator === ship?.patp && (
                <>
                  <Text.Custom
                    mx="6px"
                    fontSize={2}
                    fontWeight={200}
                    opacity={0.5}
                  >
                    •
                  </Text.Custom>
                  <Text.Custom opacity={0.5} fontWeight={200} fontSize={2}>
                    Host
                  </Text.Custom>
                </>
              )}
            </Flex>
          )}
        </Flex>

        <AvatarRow
          people={peopleNoHost ?? []}
          backgroundColor={tray ? dockColor : windowColor}
        />
      </Flex>
      {/* room deletion button */}
      {/* {tray !== true && (creator === ship.patp || provider === ship.patp) && (
        <IconButton
          size={26}
          customBg={bgColor}
          onClick={(evt: any) => {
            evt.stopPropagation();
            // RoomsActions.deleteRoom(id);
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
};

export const RoomRow = observer(RoomRowPresenter);
