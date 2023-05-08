import { useState } from 'react';
import styled from 'styled-components';

import { MOBILE_WIDTH } from '../consts';
import { SpaceKeys, TrayAppType } from '../types';
import { SystemBar } from './SystemBar';

const FooterContainer = styled.footer`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px;

  @media (max-width: ${MOBILE_WIDTH}px) {
    display: none;
  }
`;

export const Footer = () => {
  const [currentSpace, _setCurrentSpace] =
    useState<SpaceKeys>('realm-forerunners');
  // const [theme, setTheme] = useState<ThemeProps>(spaces[currentSpace].theme);
  const [trayApp, setTrayApp] = useState<TrayAppType | null>(null);

  return (
    <FooterContainer>
      <SystemBar
        currentSpace={currentSpace}
        currentApp={trayApp}
        setCurrentApp={setTrayApp}
      />
    </FooterContainer>
  );
};
