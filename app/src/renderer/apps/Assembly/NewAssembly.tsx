import { observer } from 'mobx-react';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { FC } from 'react';
import {
  Flex,
  Grid,
  IconButton,
  Icons,
  Text,
  Input,
  TextButton,
  Checkbox,
} from 'renderer/components';
import { SoundActions } from 'renderer/logic/actions/sound';
import { useTrayApps } from 'renderer/logic/apps/store';
import { useServices } from 'renderer/logic/store';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';

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
    const { assemblyApp } = useTrayApps();

    const { dockColor, windowColor, inputColor } = desktop.theme;
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
                assemblyApp.setView('list');
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
            />
            <TextButton
              showBackground
              textColor="#0FC383"
              highlightColor="#0FC383"
              style={{ borderRadius: 6, height: 34 }}
              onClick={(evt: any) => {
                evt.stopPropagation();
                const peopleList: string[] = [ship?.patp!];
                SoundActions.playRoomEnter();
                assemblyApp.setView('room');
                assemblyApp.startRoom({
                  id: `${ship?.patp}/new-room`,
                  title: 'New room',
                  host: ship?.patp!,
                  // @ts-ignore
                  people: peopleList,
                  private: false,
                  cursors: true,
                });
              }}
            >
              Start
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
