import styled from 'styled-components';

import { MOBILE_WIDTH } from '../consts';

export const HeaderContainer = styled.header`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;

  @media (max-width: ${MOBILE_WIDTH}px) {
    #holium-logo {
      display: none;
    }
  }
`;

export const HeaderNavigation = styled.nav`
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

export const UnstyledLink = styled.a`
  color: inherit;
  text-decoration: none;
`;

export const HeaderCTAs = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const HeaderMenuLink = styled(UnstyledLink)<{
  current?: boolean;
}>`
  padding: 2px 0;
  opacity: ${({ current }) => (current ? 1 : 0.5)};
  border-bottom: ${({ current }) => (current ? '2px solid' : 'none')};

  &:hover {
    opacity: 1;
  }
`;
