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

type Props = {
  currentSpace: SpaceKeys;
  setCurrentApp: (app: TrayAppType) => void;
};

export const Footer = ({ currentSpace, setCurrentApp }: Props) => (
  <FooterContainer>
    <SystemBar currentSpace={currentSpace} setCurrentApp={setCurrentApp} />
  </FooterContainer>
);
