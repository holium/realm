import { useMemo, useState } from 'react';
import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';

import {
  Button,
  Flex,
  Icon,
  Spinner,
  Text,
  TextInput,
} from '@holium/design-system';

import { SoundActions } from 'renderer/lib/sound';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { useTrayApps } from '../store';
import { useRoomsStore } from './store/RoomsStoreContext';

export const createRoomForm = (
  currentRooms: string[],
  defaults: any = {
    name: '',
    isPrivate: false,
  }
) => {
  const form = createForm({
    onSubmit({ values }: { values: any }) {
      return values;
    },
  });

  const name = createField({
    id: 'name',
    form,
    initialValue: defaults.name || '',
    // validationSchema: yup.string().required('Name is required'),
    validate: (name: string) => {
      // if (addedShips.includes(patp)) {
      //   return { error: 'Already added', parsed: undefined };
      // }

      if (
        name.length > 1 &&
        /^[a-zA-Z0-9- ]*$/.test(name) &&
        !currentRooms.includes(name)
      ) {
        return { error: undefined, parsed: name };
      }

      return { error: 'Invalid Name', parsed: undefined };
    },
  });

  const isPrivate = createField({
    id: 'isPrivate',
    form,
    initialValue: defaults.isPrivate || false,
  });

  return {
    form,
    name,
    isPrivate,
  };
};

const NewRoomPresenter = () => {
  const roomsStore = useRoomsStore();
  const { loggedInAccount } = useAppState();
  const { spacesStore } = useShipStore();
  const { roomsApp } = useTrayApps();
  const [loading, setLoading] = useState(false);

  const { form, name } = useMemo(
    () => createRoomForm(roomsStore.roomsList.map((room) => room.title)),
    []
  );

  const createRoom = async (evt: any) => {
    // setLoading(true)
    if (roomsStore.currentRoom) {
      if (roomsStore.currentRoom.creator === loggedInAccount?.serverId) {
        roomsStore.deleteRoom(roomsStore.currentRoom.rid);
      } else {
        roomsStore.leaveRoom(roomsStore.currentRoom.rid);
      }
    }
    SoundActions.playRoomEnter();
    const { name, isPrivate } = form.actions.submit();
    evt.stopPropagation();
    const spacePath =
      spacesStore.selected?.type !== 'our'
        ? spacesStore.selected?.path ?? ''
        : null;

    setLoading(true);
    await roomsStore?.createRoom(
      name,
      isPrivate ? 'private' : 'public',
      spacePath
    );
    setLoading(false);
    roomsApp.setView('room');
  };

  return (
    <>
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Flex justifyContent="center" alignItems="center">
          <Button.IconButton
            className="realm-cursor-hover"
            size={26}
            onClick={(evt: any) => {
              evt.stopPropagation();
              roomsApp.setView('list');
            }}
          >
            <Icon name="ArrowLeftLine" size={22} opacity={0.7} />
          </Button.IconButton>
          <Text.Custom
            ml={2}
            opacity={0.8}
            textTransform="uppercase"
            fontWeight={600}
          >
            New Room
          </Text.Custom>
        </Flex>
        <Flex ml={1} pl={2} pr={2}></Flex>
      </Flex>
      <Flex flexDirection="column">
        <Flex flexDirection="row" alignItems="center" flex={3} gap={8}>
          <Flex flex={2}>
            <TextInput
              id="room-name-new"
              name="room-name-new"
              tabIndex={2}
              width="100%"
              type="text"
              autoFocus
              placeholder="Name your room"
              value={name.state.value}
              error={
                name.computed.isDirty && name.computed.ifWasEverBlurredThenError
              }
              onChange={(e) => {
                name.actions.onChange((e.target as any).value);
              }}
              onKeyDown={(evt) => {
                if (evt.key === 'Enter' && form.computed.isValid) {
                  createRoom(evt);
                }
              }}
              onFocus={name.actions.onFocus}
              onBlur={name.actions.onBlur}
            />
          </Flex>
          <Button.TextButton
            tabIndex={2}
            fontWeight={500}
            color="intent-success"
            disabled={!form.computed.isValid}
            justifyContent="center"
            style={{ borderRadius: 6, height: 32, minWidth: 60 }}
            onKeyDown={(evt: any) => {
              if (evt.key === 'Enter' && form.computed.isValid) {
                createRoom(evt);
              }
            }}
            onClick={(evt: any) => {
              createRoom(evt);
            }}
          >
            {loading ? <Spinner size={0} color="white" /> : 'Start'}
          </Button.TextButton>
        </Flex>
        <Flex mt={3} justifyContent="flex-start">
          {/* <Checkbox
            tabIndex={2}
            label="Private"
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                e.target.checked = !isPrivate.state.value;
                isPrivate.actions.onChange(!isPrivate.state.value);
              }
            }}
            onChange={(e: any) => {
              isPrivate.actions.onChange(e.target.checked);
            }}
            onFocus={() => isPrivate.actions.onFocus()}
            onBlur={() => isPrivate.actions.onBlur()}
          /> */}
        </Flex>
      </Flex>
    </>
  );
};

export const NewRoom = observer(NewRoomPresenter);
