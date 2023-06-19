import styled from 'styled-components';

import { GrayBox } from '../GetRealm/GetRealmDialogBody.styles';

export const UploadBoxContainer = styled(GrayBox)<{
  isEmpty: boolean;
}>`
  position: relative;
  gap: 0;
  height: 80px;
  align-items: center;
  justify-content: center;
  border-style: dashed;

  ${({ isEmpty }) =>
    isEmpty &&
    `
    cursor: pointer;
  `}
`;

export const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 10px;
  padding: 1px;
  background-color: rgba(var(--rlm-border-rgba), 0.9);
  border-radius: 36px;
  position: relative;
  overflow: hidden;

  &:after {
    content: '';
    position: absolute;
    top: 1px;
    left: 1px;
    width: ${({ progress }) => progress}%;
    height: 8px;
    background-color: var(--rlm-accent-color);
    border-radius: 36px;
  }
`;
