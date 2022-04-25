import { FC, useMemo } from 'react';
import { useMst } from '../../../../../../../logic/store';
import { clone } from 'mobx-state-tree';
import {
  Flex,
  Text,
  Icons,
  Sigil,
  Divider,
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
  const ship = useMemo(() => clone(shipStore.session!), [shipStore.session]);

  return (
    <SystemBarStyle pr={2} width="100%" customBg={theme.backgroundColor}>
      <SpaceSelector theme={theme} />
      <Divider ml={2} mr={2} />
    </SystemBarStyle>
  );
};

export default { CommunityBar };
