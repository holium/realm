import { FC, useState, useMemo } from 'react';
import { lighten, rgba } from 'polished';
import {
  Flex,
  Icons,
  Divider,
  IconButton,
} from '../../../../../../../components';
import { SystemBarStyle } from '../../SystemBar.styles';
import { ThemeStoreType } from '../../../../../../../logic/theme/store';
import { SpaceSelector } from './SpaceSelector';

type CommunityBarProps = {
  theme: ThemeStoreType;
};

export const CommunityBar: FC<CommunityBarProps> = (
  props: CommunityBarProps
) => {
  const { theme } = props;

  // const [isSearching, setIsSearching] = useState(false);
  const { textColor, dockColor } = theme;
  const dividerBg = useMemo(() => rgba(lighten(0.2, dockColor), 0.4), [theme]);
  const iconColor = textColor;

  return (
    <SystemBarStyle pr={3} width="100%" customBg={theme.dockColor}>
      <SpaceSelector theme={theme} />
      <Divider customBg={dividerBg} ml={2} mr={2} />
      <Flex flex={1}></Flex>
      <Flex>
        <IconButton customBg={dockColor} size={24} ml={1} color={iconColor}>
          <Icons name="Search" />
        </IconButton>
      </Flex>
    </SystemBarStyle>
  );
};

export default { CommunityBar };
