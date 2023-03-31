import styled from 'styled-components';

type Props = {
  textColor?: string;
};

export const MenuItemDivider = styled.hr<Props>`
  border: 0;
  height: 1px;
  margin: 4px 8px;
  background: ${({ textColor }) => textColor || 'var(--rlm-text-color)'};
  opacity: 0.2;
`;
