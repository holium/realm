import { FC, useState } from 'react';
import { useMst } from '../../../../../../../logic/store';
import { darken } from 'polished';
import { clone } from 'mobx-state-tree';
import {
  Flex,
  Text,
  Icons,
  Sigil,
  Divider,
  IconButton,
} from '../../../../../../../components';
import { SystemBarStyle } from '../../SystemBar.styles';
import { WindowThemeType } from '../../../../../../../logic/stores/config';
import { SpaceSelector } from './SpaceSelector';

type CommunityBarProps = {
  theme: Partial<WindowThemeType>;
};

export const CommunityBar: FC<CommunityBarProps> = (
  props: CommunityBarProps
) => {
  const { shipStore } = useMst();
  const { theme } = props;
  const [isSearching, setIsSearching] = useState(false);
  const { textColor } = theme;
  const iconColor = textColor;

  return (
    <SystemBarStyle pr={3} width="100%" customBg={theme.backgroundColor}>
      <SpaceSelector theme={theme} />
      <Divider ml={2} mr={2} />
      <Flex flex={1}></Flex>
      <Flex>
        <IconButton size={24} ml={1} color={iconColor}>
          <Icons name="Search" />
        </IconButton>
      </Flex>
    </SystemBarStyle>
  );
};

export default { CommunityBar };
