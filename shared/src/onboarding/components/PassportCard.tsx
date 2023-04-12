import { ChangeEvent } from 'react';
import styled from 'styled-components';
import { Flex, Button } from '@holium/design-system/general';
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

const AddImageButton = styled(Button.IconButton)`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(var(--rlm-input-rgba));

  &:hover:not(:disabled) {
    filter: brightness(0.9);
    background: rgba(var(--rlm-input-rgba));
  }
`;

const UsernameInput = styled(Input)`
  font-size: 16px;
  padding: 8px;
  border-radius: 4px;
`;

const DescriptionTextArea = styled(UsernameInput)`
  font-size: 13px;
  padding: 4px 8px;
  resize: none;
  line-height: 18px;
  height: 28px;
`;

type Props = {
  patp: string;
  username: string;
  description: string;
  setUsername: (username: string) => void;
  setDescription: (description: string) => void;
  onSetAvatar: () => void;
};

export const PassportCard = ({
  patp,
  username,
  description,
  setUsername,
  setDescription,
  onSetAvatar,
}: Props) => {
  const onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  return (
    <PassportCardContainer>
      <PassportCardAvatar patp={patp} onSetAvatar={onSetAvatar} />
      <Flex flex={1} flexDirection="column" gap={16}>
        <Flex flexDirection="column" gap={6}>
          <UsernameInput
            placeholder="Your username"
            required
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
