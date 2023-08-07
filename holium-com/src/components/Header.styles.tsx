import styled from 'styled-components';

import { MOBILE_WIDTH } from '../constants';
import { UnstyledNextLink } from './UnstyledNextLink';

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

    @media (max-width: ${MOBILE_WIDTH}px) {
      gap: 12px;
    }
  }
`;

export const HeaderCTAs = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const HeaderMenuLink = styled(UnstyledNextLink)<{
  current?: boolean;
}>`
  font-size: 18px;
  padding-bottom: 2px;
  opacity: ${({ current }) => (current ? 1 : 0.5)};
  border-bottom: ${({ current }) => (current ? '2px solid' : 'none')};

  &:hover {
    opacity: 1;
  }

  @media (max-width: ${MOBILE_WIDTH}px) {
    font-size: 16px;
  }
`;
