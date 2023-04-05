import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { TextInput, Text, Button, Flex, Icon } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from '../store';
import { useRooms } from './useRooms';

export const createRoomForm = (
  currentRooms: any,
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
  const { ship, spaces } = useServices();
  const { roomsApp } = useTrayApps();
  const roomsManager = useRooms(ship?.patp);

  const { form, name } = useMemo(
    () => createRoomForm(roomsManager.rooms.map((room: any) => room.title)),
    []
  );

  const createRoom = (evt: any) => {
    // setLoading(true);
    const { name, isPrivate } = form.actions.submit();
    evt.stopPropagation();
    const spacePath =
      spaces.selected?.type !== 'our' ? spaces.selected?.path ?? '' : null;
    roomsManager?.createRoom(name, isPrivate ? 'private' : 'public', spacePath);
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
            style={{ borderRadius: 6, height: 32 }}
            onKeyDown={(evt: any) => {
              if (evt.key === 'Enter' && form.computed.isValid) {
                createRoom(evt);
              }
            }}
            onClick={(evt: any) => {
              createRoom(evt);
            }}
          >
            Start
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
