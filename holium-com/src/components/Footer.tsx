import styled from 'styled-components';

import { SpaceKeys, TrayAppType } from '../types';
import { SystemBar } from './SystemBar';

const FooterContainer = styled.footer`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px;
`;

type Props = {
  currentSpace: SpaceKeys;
  setCurrentApp: (app: TrayAppType) => void;
};

export const Footer = ({ currentSpace, setCurrentApp }: Props) => (
  <FooterContainer className="hideonmobile">
    <SystemBar currentSpace={currentSpace} setCurrentApp={setCurrentApp} />
  </FooterContainer>
);
