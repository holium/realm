import { FC, createRef } from 'react';
import { motion } from 'framer-motion';
import { useMst } from '../../../../../../../../logic/store';
import { Flex, Text, Sigil } from '../../../../../../../../components';
import { WindowThemeType } from '../../../../../../../../logic/stores/config';
import { TrayButton } from '../../TrayButton';
import { TrayMenu } from '../../TrayMenu';
import { MiniApp } from '../../MiniAppWindow';
import { Spaces } from '../../../../../../../apps/Spaces';

type SpaceSelectorProps = {
  theme: WindowThemeType;
};

export const SpaceSelector: FC<SpaceSelectorProps> = (
  props: SpaceSelectorProps
) => {
  const { theme } = props;
  const { shipStore } = useMst();
  const selectorRef = createRef<HTMLDivElement>();
  const appRef = createRef<HTMLDivElement>();

  const { backgroundColor, textColor } = theme;
  const dimensions = {
    height: 500,
    width: 400,
  };

  return (
    <TrayMenu
      id="spaces-tray"
      appRef={appRef}
      buttonRef={selectorRef}
      dimensions={dimensions}
      position="top-right"
      buttonOffset={{ x: 4 }}
      content={
        <MiniApp
          id="spaces-tray-app"
          ref={appRef}
          dimensions={dimensions}
          backgroundColor={backgroundColor}
          textColor={textColor}
        >
          <Spaces theme={props.theme} dimensions={dimensions} />
        </MiniApp>
      }
    >
      <TrayButton
        id="spaces-tray-icon"
        ref={selectorRef}
        whileTap={{ scale: 0.975 }}
        transition={{ scale: 0.2 }}
        customBg={theme.backgroundColor}
      >
        {/* <Flex
          style={{
            height: 28,
            width: 28,
            background: 'black',
            borderRadius: 4,
            pointerEvents: 'none',
          }}
        /> */}
        <Sigil
          simple
          size={28}
          avatar={null}
          patp={shipStore.session.patp}
          color={[shipStore.session.color || '#000000', 'white']}
        />
        <Flex
          style={{ pointerEvents: 'none' }}
          mt="2px"
          flexDirection="column"
          justifyContent="center"
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
            {shipStore.session.nickname || shipStore.session.patp.substring(1)}
          </Text>
        </Flex>
      </TrayButton>
    </TrayMenu>
  );
};

export default { SpaceSelector };
