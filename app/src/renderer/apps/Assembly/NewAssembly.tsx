import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import { ThemeModelType } from 'os/services/shell/theme.model';
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
import { useTrayApps } from 'renderer/logic/apps/store';
import { useServices } from 'renderer/logic/store';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { camelToSnake, snakeify } from 'os/lib/obj';

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
    validationSchema: yup.string().required('Name is required'),
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

export type BaseAssemblyProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const NewAssembly: FC<BaseAssemblyProps> = observer(
  (props: BaseAssemblyProps) => {
    const { dimensions } = props;
    const { desktop, ship } = useServices();
    const [loading, setLoading] = useState(false);

    const { dockColor, windowColor, inputColor } = desktop.theme;

    const { form, name, isPrivate } = useMemo(() => createRoomForm(), []);

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
          <Flex
            pl={3}
            pr={4}
            mr={3}
            justifyContent="center"
            alignItems="center"
          >
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
        <Flex style={{ marginTop: 54 }} flex={1} flexDirection="column">
          <Flex
            flexDirection="row"
            alignItems="center"
            style={{
              gap: 8,
            }}
          >
            <Input
              className="realm-cursor-text-cursor"
              type="text"
              placeholder="Name your room"
              wrapperStyle={{
                cursor: 'none',
                borderRadius: 6,
                backgroundColor: inputColor,
              }}
              value={name.state.value}
              error={!name.computed.isDirty || name.computed.error}
              onChange={(e: any) => {
                name.actions.onChange(e.target.value);
              }}
              onFocus={() => name.actions.onFocus()}
              onBlur={() => name.actions.onBlur()}
            />
            <TextButton
              showBackground
              textColor="#0FC383"
              highlightColor="#0FC383"
              disabled={!form.computed.isValid || loading}
              style={{ borderRadius: 6, height: 34 }}
              onClick={(evt: any) => {
                setLoading(true);
                const { name, isPrivate } = form.actions.submit();
                evt.stopPropagation();
                RoomsActions.createRoom(
                  `${ship?.patp}/${name}/${new Date().getTime()}`,
                  isPrivate ? 'private' : 'public',
                  name,
                  true
                ).then((value) => {
                  setLoading(false);
                });
              }}
            >
              {loading ? <Spinner size={0} /> : 'Start'}
            </TextButton>
          </Flex>
          <Flex mt={2} justifyContent="flex-start">
            <Checkbox defaultValue="true" label="Private" />
          </Flex>
        </Flex>
      </Grid.Column>
    );
  }
);
