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
import { useShip } from '../../../../../../../logic/store';
import { AppDock } from './AppDock';
import { observer } from 'mobx-react';

type CommunityBarProps = {
  theme: ThemeStoreType;
};

export const CommunityBar: FC<CommunityBarProps> = observer(
  (props: CommunityBarProps) => {
    const { theme } = props;
    const { ship } = useShip();

    // const [isSearching, setIsSearching] = useState(false);
    const { textColor, dockColor } = theme;
    // const dividerBg = useMemo(() => rgba(lighten(0.2, dockColor), 0.4), [theme]);
    const iconColor = textColor;

    return (
      <SystemBarStyle pr={3} width="100%" customBg={theme.dockColor}>
        <SpaceSelector theme={theme} />
        <Flex flex={1}>
          {ship?.isLoaded && <AppDock apps={ship?.docket.list} />}
        </Flex>
        <Flex>
          <IconButton customBg={dockColor} size={24} ml={1} color={iconColor}>
            <Icons name="Search" />
          </IconButton>
        </Flex>
      </SystemBarStyle>
    );
  }
);

export default { CommunityBar };
