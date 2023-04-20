import { ChangeEvent } from 'react';
import styled from 'styled-components';
import { Flex } from '@holium/design-system/general';
import { Input } from '@holium/design-system/inputs';
import { AccountDialogSubtitle } from './AccountDialog.styles';
import { PassportCardAvatar } from './PassportCardAvatar';

const PassportCardContainer = styled(Flex)`
  flex: 1;
  gap: 20px;
  padding: 12px;
  border-radius: 9px;
  border: 1px solid rgba(var(--rlm-border-rgba));
  background-color: rgba(var(--rlm-window-rgba));
`;

const UsernameInput = styled(Input)`
  font-size: 16px;
  padding: 8px;
  border-radius: 4px;
  filter: brightness(0.96);
`;

const DescriptionTextArea = styled(UsernameInput)`
  font-size: 13px;
  padding: 4px 8px;
  resize: none;
  line-height: 18px;
  height: 28px;
  filter: brightness(0.96);
`;

type Props = {
  patp: string;
  username: string;
  description: string;
  setUsername: (username: string) => void;
  setDescription: (description: string) => void;
  setAvatarSrc: (src?: string) => void;
  onUploadFile: (file: File) => Promise<string | undefined>;
};

export const PassportCard = ({
  patp,
  username,
  description,
  setUsername,
  setDescription,
  setAvatarSrc,
  onUploadFile,
}: Props) => {
  const onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  return (
    <PassportCardContainer>
      <PassportCardAvatar
        patp={patp}
        setAvatarSrc={setAvatarSrc}
        onUploadFile={onUploadFile}
      />
      <Flex flex={1} flexDirection="column" gap={16}>
        <Flex flexDirection="column" gap={6}>
          <UsernameInput
            required
            placeholder="Your nickname"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
