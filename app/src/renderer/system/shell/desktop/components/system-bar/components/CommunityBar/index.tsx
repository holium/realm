import { FC, useMemo } from 'react';
import { useMst } from '../../../../../../../logic/store';
import { clone } from 'mobx-state-tree';
import { Flex, Text, Icons, Sigil } from '../../../../../../../components';
import { SystemBarStyle } from '../../SystemBar.styles';
import { WindowThemeType } from '../../../../../../../logic/stores/config';

type CommunityBarProps = {
  theme: Partial<WindowThemeType>;
};

export const CommunityBar: FC<CommunityBarProps> = (
  props: CommunityBarProps
) => {
  const { shipStore } = useMst();
  const { theme } = props;
  const ship = useMemo(() => clone(shipStore.session!), [shipStore.session]);

  return (
    <SystemBarStyle pl={1} pr={2} width="100%" customBg={theme.backgroundColor}>
      <Flex p={1} height="100%" flexDirection="row" alignItems="center" gap={8}>
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
          <Text color={theme.textColor} fontSize={3} fontWeight={500}>
            Swolesome Fund
          </Text>
        </Flex>
      </Flex>
    </SystemBarStyle>
  );
};

export default { CommunityBar };
