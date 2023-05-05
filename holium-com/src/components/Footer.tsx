import styled from 'styled-components';

import { MOBILE_WIDTH } from '../consts';

const FooterContainer = styled.header`
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;

  @media (max-width: ${MOBILE_WIDTH}px) {
    display: none;
  }
`;

export const Footer = () => <FooterContainer>Systembar</FooterContainer>;
