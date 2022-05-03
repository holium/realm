import { FC, createRef, useMemo } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { WindowThemeType } from 'renderer/logic/stores/config';

import { useShip } from '../../../../../../../../logic/store';
import { Flex, Text, Sigil, Pulser } from '../../../../../../../../components';
import { TrayButton } from '../../TrayButton';
import { TrayMenu } from '../../TrayMenu';
import { MiniApp } from '../../MiniAppWindow';
import { Spaces } from '../../../../../../../apps/Spaces';
import { clone } from 'mobx-state-tree';
import { rgba, lighten } from 'polished';
import { ThemeStoreType } from '../../../../../../../../logic/theme/store';

type SpaceSelectorProps = {
  theme: ThemeStoreType;
};

const FadeInMotion = {
  initial: { opacity: 0 },
  exit: { opacity: 0 },
  animate: {
    opacity: 1,
  },
  transition: { opacity: { duration: 1, ease: 'easeIn' } },
};

export const SpaceSelector: FC<SpaceSelectorProps> = (
  props: SpaceSelectorProps
) => {
  const { ship, shipLoader } = useShip();
  const { theme } = props;
  const selectorRef = createRef<HTMLDivElement>();
  const appRef = createRef<HTMLDivElement>();

  const { windowColor, dockColor, textColor } = theme;
  const dimensions = {
    height: 500,
    width: 380,
  };

  return (
    <TrayMenu
      id="spaces-tray"
      appRef={appRef}
      buttonRef={selectorRef}
      dimensions={dimensions}
      position="top-right"
      buttonOffset={{ x: 4, y: 18 }}
      content={
        <MiniApp
          id="spaces-tray-app"
          ref={appRef}
          dimensions={dimensions}
          backgroundColor={windowColor}
          textColor={textColor}
        >
          <Spaces theme={theme} dimensions={dimensions} />
        </MiniApp>
      }
    >
      {shipLoader.isLoaded ? (
        <TrayButton
          id="spaces-tray-icon"
          ref={selectorRef}
          whileTap={{ scale: 0.975 }}
          transition={{ scale: 0.2 }}
          customBg={dockColor}
        >
          <Sigil
            simple
            size={28}
            avatar={null}
            patp={ship!.patp}
            color={[ship!.color || '#000000', 'white']}
          />

          <Flex
            style={{ pointerEvents: 'none' }}
            mt="2px"
            flexDirection="column"
            justifyContent="center"
            {...FadeInMotion}
          >
            <Text
              style={{ pointerEvents: 'none' }}
              color={theme.textColor}
              lineHeight="12px"
              fontSize={1}
              opacity={0.5}
            >
              You
            </Text>
            <Text
              style={{ pointerEvents: 'none' }}
              color={theme.textColor}
              fontSize={2}
              fontWeight={500}
            >
              {ship!.nickname || ship!.patp.substring(1)}
            </Text>
          </Flex>
        </TrayButton>
      ) : (
        <TrayButton
          id="spaces-tray-icon"
          ref={selectorRef}
          whileTap={{ scale: 0.975 }}
          transition={{ scale: 0.2 }}
          customBg={dockColor}
        >
          <Flex>
            <Pulser
              background={rgba(theme.backgroundColor, 0.5)}
              borderRadius={4}
              height={28}
              width={28}
            />
          </Flex>
          <Flex
            style={{ pointerEvents: 'none' }}
            // mt="2px"
            flexDirection="column"
            justifyContent="center"
          >
            <Pulser
              style={{ marginBottom: 2 }}
              background={rgba(theme.backgroundColor, 0.5)}
              borderRadius={4}
              height={12}
              width={40}
            />
            <Pulser
              background={rgba(theme.backgroundColor, 0.5)}
              borderRadius={4}
              height={14}
              width={90}
            />
          </Flex>
        </TrayButton>
      )}
    </TrayMenu>
  );
};

export default { SpaceSelector };
