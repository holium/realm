import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import { ThemeModelType } from 'os/services/theme.model';
import { FC, useMemo, useState } from 'react';
import {
  Flex,
  Grid,
  IconButton,
  Icons,
  Text,
  Input,
  TextButton,
  Checkbox,
  Spinner,
} from 'renderer/components';
import * as yup from 'yup';
import { RoomsActions } from 'renderer/logic/actions/rooms';
import { useServices } from 'renderer/logic/store';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { useTrayApps } from '../store';

export const createRoomForm = (
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
        name.length < 20 &&
        /^[a-zA-Z0-9- ]*$/.test(name)
      ) {
        return { error: undefined, parsed: name };
      }

      return { error: 'Invalid Name', parsed: undefined };
    },
  });

  const isPrivate = createField({
    id: 'isPrivate',
    form: form,
    initialValue: defaults.isPrivate || false,
  });

  return {
    form,
    name,
    isPrivate,
  };
};
export type BaseRoomProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};
export const NewRoom: FC<BaseRoomProps> = observer((props: BaseRoomProps) => {
  const { dimensions } = props;
  const { theme, ship } = useServices();
  const [loading, setLoading] = useState(false);
  const { roomsApp } = useTrayApps();

  const { dockColor, windowColor, inputColor } = theme.currentTheme;

  const { form, name, isPrivate } = useMemo(() => createRoomForm(), []);

  const createRoom = (evt: any) => {
    setLoading(true);
    const { name, isPrivate } = form.actions.submit();
    evt.stopPropagation();
    RoomsActions.createRoom(
      `${roomsApp.provider}/${name}/${new Date().getTime()}`,
      isPrivate ? 'private' : 'public',
      name,
    ).then(() => {
      setLoading(false);
    });
  };

  return (
    <Grid.Column
      style={{ position: 'relative', height: dimensions.height }}
      expand
      overflowY="hidden"
    >
      <Titlebar
        hasBlur
        hasBorder={false}
        zIndex={5}
        theme={{
          ...props.theme,
          windowColor,
        }}
      >
        <Flex pl={3} pr={4} mr={3} justifyContent="center" alignItems="center">
          <IconButton
            className="realm-cursor-hover"
            size={26}
            style={{ cursor: 'none' }}
            customBg={dockColor}
            onClick={(evt: any) => {
              evt.stopPropagation();
              RoomsActions.setView('list');
            }}
          >
            <Icons name="ArrowLeftLine" />
          </IconButton>
          <Text
            ml={2}
            opacity={0.8}
            style={{ textTransform: 'uppercase' }}
            fontWeight={600}
          >
            New Room
          </Text>
        </Flex>
        <Flex ml={1} pl={2} pr={2}></Flex>
      </Titlebar>

      {!roomsApp.liveRoom ? (
        <Flex style={{ marginTop: 58 }} flex={1} flexDirection="column">
          <Flex
            flexDirection="row"
            alignItems="center"
            style={{
              gap: 8,
            }}
          >
            <Input
              tabIndex={2}
              className="realm-cursor-text-cursor"
              type="text"
              placeholder="Name your room"
              autoFocus
              wrapperStyle={{
                cursor: 'none',
                borderRadius: 6,
                backgroundColor: inputColor,
              }}
              value={name.state.value}
              error={
                name.computed.isDirty && name.computed.ifWasEverBlurredThenError
              }
              onChange={(e: any) => {
                name.actions.onChange(e.target.value);
              }}
              onKeyDown={(evt: any) => {
                if (evt.key === 'Enter') {
                  createRoom(evt);
                }
              }}
              onFocus={() => name.actions.onFocus()}
              onBlur={() => name.actions.onBlur()}
            />
            <TextButton
              tabIndex={2}
              showBackground
              textColor="#0FC383"
              highlightColor="#0FC383"
              disabled={!form.computed.isValid || loading}
              style={{ borderRadius: 6, height: 34 }}
              onKeyDown={(evt: any) => {
                if (evt.key === 'Enter') {
                  createRoom(evt);
                }
              }}
              onClick={(evt: any) => {
                createRoom(evt);
              }}
            >
              {loading ? <Spinner size={0} /> : 'Start'}
            </TextButton>
          </Flex>
          <Flex mt={3} justifyContent="flex-start">
            <Checkbox
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
            />
          </Flex>
        </Flex>
      ) : (
        <Flex
          flexDirection={'column'}
          onClick={() => console.log('ASDA', roomsApp.liveRoom)}
        >
          <Text mt={100} opacity={0.7}>
            you have to exit your room before you can create a new one
          </Text>
        </Flex>
      )}
    </Grid.Column>
  );
});
