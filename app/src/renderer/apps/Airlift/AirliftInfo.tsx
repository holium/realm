import { FC } from "react";
import {
  Grid,
  Flex,
  Icons,
  Text,
  TextButton,
  InnerNotification,
  Tooltip,
  IconButton,
  Spinner,
} from 'renderer/components';
import { ThemeModelType } from 'os/services/theme.model';
import { useServices } from 'renderer/logic/store';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { observer } from "mobx-react";

export type RoomAppProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};
  
export const AirliftInfo: FC<RoomAppProps> = observer((props: RoomAppProps) => {
  const { dimensions } = props;
  const { theme } = useServices();
  const { windowColor } = theme.currentTheme;
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
        <Icons opacity={0.8} name="Airlift" size={26} mr={2} />
        <Text
          opacity={0.8}
          style={{ textTransform: 'uppercase' }}
          fontWeight={600}
        >
          irlift
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
        <Text>To drop an airlift into Realm, drag the Airlift icon from the System Bar into the current Space.</Text>
    </Flex>
  </Grid.Column>
  );
});