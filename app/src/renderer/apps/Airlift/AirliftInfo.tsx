import { FC } from 'react';
import { Grid, Flex, Icons, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { Titlebar } from 'renderer/system/desktop/components/AppWindow/Titlebar/Titlebar';
import { observer } from 'mobx-react';

/*export type AirliftInfoProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};*/

export const AirliftInfo: FC<AirliftInfoProps> = observer(() => {
  // const { dimensions } = props;
  const { theme } = useServices();
  const { windowColor } = theme.currentTheme;
  return (
    <Grid.Column
      style={{ position: 'relative' /*height: dimensions.height*/ }}
      expand
      overflowY="hidden"
    >
      <Titlebar
        hasBlur
        hasBorder={false}
        zIndex={5}
        theme={{
          // ...props.theme,
          windowColor,
        }}
        appWindow={undefined}
        onClose={function (): void {
          throw new Error('Function not implemented.');
        }}
        onMinimize={function (): void {
          throw new Error('Function not implemented.');
        }}
        onMaximize={function (): void {
          throw new Error('Function not implemented.');
        }}
        onDevTools={function (): void {
          throw new Error('Function not implemented.');
        }}
        onDragStop={function (e: any): void {
          throw new Error('Function not implemented.');
        }}
        onDragStart={function (e: any): void {
          throw new Error('Function not implemented.');
        }}
      >
        <Flex pl={3} pr={4} mr={3} justifyContent="center" alignItems="center">
          <Icons opacity={0.8} name="Airlift" size={26} />
          <Text
            opacity={0.8}
            style={{ textTransform: 'lowercase' }}
            fontWeight={500}
            fontSize={26}
          >
            Airlift
          </Text>
        </Flex>
      </Titlebar>
      <Flex
        style={{ marginTop: 54, maxHeight: '100%' }}
        gap={8}
        flex={1}
        flexDirection="column"
        overflowY={'scroll'}
      >
        <Text fontWeight={550}>
          Coding Gall agents is hard.
          <br />
          You might need an{' '}
          <a href="https://history.state.gov/milestones/1945-1952/berlin-airlift">
            airlift
          </a>
          .
        </Text>
        <Text>
          To drop an airlift into Realm, drag the Airlift icon from the System
          Bar into the current Space.
        </Text>
      </Flex>
    </Grid.Column>
  );
});
