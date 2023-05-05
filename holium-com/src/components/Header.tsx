import styled from 'styled-components';

import { MOBILE_WIDTH } from '../consts';

const HeaderContainer = styled.header`
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: ${MOBILE_WIDTH}px) {
    flex-direction: column;
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  ul {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    list-style: none;
  }
`;

const CTAs = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

export const Header = () => (
  <HeaderContainer>
    <img src="/wordmark.svg" alt="Holium" />
    <Navigation>
      <ul>
        <li>Realm</li>
        <li>Developers</li>
        <li>Support</li>
      </ul>
    </Navigation>
    <CTAs>
      <button>Get Realm</button>
      <button>Login</button>
    </CTAs>
  </HeaderContainer>
);
