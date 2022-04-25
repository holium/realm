import { FC } from 'react';
import { motion } from 'framer-motion';
import { useMst } from '../../../../../../../../logic/store';
import { Flex, Text } from '../../../../../../../../components';
import { WindowThemeType } from '../../../../../../../../logic/stores/config';
import { TrayButton } from '../../TrayButton';

type SpaceSelectorProps = {
  theme: Partial<WindowThemeType>;
};

export const SpaceSelector: FC<SpaceSelectorProps> = (
  props: SpaceSelectorProps
) => {
  const { theme } = props;
  const { shipStore } = useMst();

  return (
    <TrayButton
      whileTap={{ scale: 0.975 }}
      transition={{ scale: 0.2 }}
      customBg={theme.backgroundColor}
    >
      <Flex
        style={{
          height: 28,
          width: 28,
          background: 'black',
          borderRadius: 4,
        }}
      />
      <Flex mt="2px" flexDirection="column" justifyContent="center">
        <Text
          color={theme.textColor}
          lineHeight="12px"
          fontSize={1}
          opacity={0.5}
        >
          DAO
        </Text>
        <Text color={theme.textColor} fontSize={2} fontWeight={500}>
          Swolesome Fund
        </Text>
      </Flex>
    </TrayButton>
  );
};

export default { SpaceSelector };
