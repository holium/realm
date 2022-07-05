import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { Grid, Flex, Icons, Text, TextButton } from 'renderer/components';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { Row } from 'renderer/components/NewRow';
import { AssemblyRow } from './components/AssemblyRow';
import { Titlebar } from 'renderer/system/desktop/components/AppWindow/Titlebar';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from 'renderer/logic/apps/store';
import { AssemblyModelType } from 'renderer/logic/apps/assembly';

export type AssemblyListProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const Assemblies: FC<AssemblyListProps> = observer(
  (props: AssemblyListProps) => {
    const { dimensions } = props;
    const { ship, shell } = useServices();
    const { backgroundColor, textColor, windowColor, iconColor } =
      shell.desktop.theme;
    const [muted, setMuted] = useState(false);
    const { assemblyApp } = useTrayApps();
    const { selected, assemblies } = assemblyApp;
    const amHosting =
      assemblies.findIndex((a: any) => a.host === ship?.patp) !== -1;

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
            <Icons opacity={0.8} name="Connect" size={26} mr={2} />
            <Text
              opacity={0.8}
              style={{ textTransform: 'uppercase' }}
              fontWeight={600}
            >
              Assembly
            </Text>
          </Flex>
          <Flex ml={1} pl={2} pr={2}>
            <TextButton
              disabled={amHosting}
              onClick={(evt: any) => {
                evt.stopPropagation();
                assemblyApp.setView('new-assembly');
              }}
            >
              Create
            </TextButton>
          </Flex>
        </Titlebar>
        <Flex style={{ marginTop: 54 }} flex={1} flexDirection="column">
          {assemblies.length === 0 && (
            <Flex
              flex={1}
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              mb={46}
            >
              <Text fontWeight={500} mb={2} opacity={0.5}>
                No assemblies
              </Text>
              <Text width="90%" textAlign="center" opacity={0.3}>
                An assembly is a room for communication and collaboration
              </Text>
            </Flex>
          )}
          {assemblies.map((room: AssemblyModelType, index: number) => {
            return (
              <AssemblyRow
                key={`${room.title}-${index}`}
                id={room.id}
                title={room.title}
                host={room.host}
                people={room.people}
                cursors={room.cursors}
                private={room.private}
                onClick={(evt: any) => {
                  evt.stopPropagation();
                  assemblyApp.setSelected(room);
                  assemblyApp.setView('room');
                }}
              />
            );
          })}
        </Flex>
      </Grid.Column>
    );
  }
);
