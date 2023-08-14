import { ChangeEvent } from 'react';
import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';
import { Input } from '@holium/design-system/inputs';

import { AccountDialogSubtitle } from './AccountDialog.styles';
import { PassportCardAvatar } from './PassportCardAvatar';

const PassportCardContainer = styled(Flex)<{ noContainer?: boolean }>`
  flex: 1;
  gap: 20px;
  padding: 12px;
  border-radius: 9px;
  border: 1px solid rgba(var(--rlm-border-rgba));
  background-color: rgba(var(--rlm-window-rgba));

  ${({ noContainer }) =>
    noContainer &&
    `
    padding: 0;
    border: none;
    background-color: transparent;
  `}
`;

const NicknameInput = styled(Input)`
  font-size: 16px;
  padding: 8px;
  border-radius: 4px;
  filter: brightness(0.96);
`;

const DescriptionTextArea = styled(NicknameInput)`
  font-size: 13px;
  padding: 4px 8px;
  resize: none;
  line-height: 18px;
  height: 28px;
  filter: brightness(0.96);
`;

type Props = {
  patp: string;
  nickname: string;
  color?: string;
  description: string;
  initialAvatarSrc: string;
  noContainer?: boolean;
  setNickname: (nickname: string) => void;
  setDescription: (description: string) => void;
  setAvatarSrc: (src?: string) => void;
  onUploadFile: (file: File) => Promise<string | null>;
};

export const PassportForm = ({
  patp,
  color = '#000000',
  nickname,
  description,
  initialAvatarSrc,
  noContainer,
  setNickname,
  setDescription,
  setAvatarSrc,
  onUploadFile,
}: Props) => {
  const onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  return (
    <PassportCardContainer noContainer={noContainer}>
      <PassportCardAvatar
        patp={patp}
        color={color}
        initialAvatarSrc={initialAvatarSrc}
        setAvatarSrc={setAvatarSrc}
        onUploadFile={onUploadFile}
      />
      <Flex flex={1} flexDirection="column" gap={16}>
        <Flex flexDirection="column" gap={6}>
          <NicknameInput
            required
            placeholder="Your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <AccountDialogSubtitle>ID: {patp}</AccountDialogSubtitle>
        </Flex>
        <DescriptionTextArea
          as="textarea"
          placeholder="Add a few sentences about yourself"
          value={description}
          onChange={onChangeDescription}
        />
      </Flex>
    </PassportCardContainer>
  );
};
