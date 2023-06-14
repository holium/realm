import { MouseEvent, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';

import { Flex, Row, Text } from '@holium/design-system';

import {
  ContextMenuOption,
  useContextMenu,
} from 'renderer/components/ContextMenu';
import { useAppState } from 'renderer/stores/app.store';

import { useRoomsStore } from '../store/RoomsStoreContext';
import { AvatarRow } from './AvatarRow';

type RoomRowProps = Partial<any> & {
  tray?: boolean;
  loading?: boolean;
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
  const { loggedInAccount, theme } = useAppState();
  const roomsStore = useRoomsStore();
  const { getOptions, setOptions } = useContextMenu();
  const defaultOptions = getOptions('').filter(
    (o) => o.id === 'toggle-devtools'
  );

  const { dockColor, windowColor } = theme;

  const presentCount = present?.length ?? 0;
  let peopleText = 'people';
  if (presentCount === 1) {
    peopleText = 'person';
  }
  let titleText = title;
  if (titleText && titleText.length > 16 && tray) {
    titleText = titleText.substring(0, 16) + '...';
  }
  const isLive = roomsStore.currentRid === rid;

  const contextMenuOptions = useMemo(
    () =>
      loggedInAccount?.serverId === provider
        ? [
            {
              id: `room-delete-${rid}`,
              label: 'Delete Room',
              onClick: (evt) => {
                evt.stopPropagation();
                rid && roomsStore.deleteRoom(rid);
              },
            } as ContextMenuOption,
            ...defaultOptions,
          ]
        : defaultOptions,
    [rid, loggedInAccount, provider]
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
                {/* {present.includes(loggedInAccount.serverId) && ` - (You)`} */}
              </Text.Custom>
              {creator === loggedInAccount?.serverId && (
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
          people={present ?? []}
          backgroundColor={tray ? dockColor : windowColor}
        />
      </Flex>
      {/* room deletion button */}
      {/* {tray !== true && (creator === loggedInAccount.serverId || provider === loggedInAccount.serverId) && (
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
