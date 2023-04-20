import { useState } from 'react';
import styled from 'styled-components';
import { Flex, Box, Spinner } from '@holium/design-system/general';
import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../components/OnboardDialog.styles';
import { OnboardDialog } from '../components/OnboardDialog';
import { AccountDialogSubtitle } from '../components/AccountDialog.styles';
import { PassportCard } from '../components/PassportCard';
import { AddImageIcon } from '../icons/AddImageIcon';

const List = styled.ul`
  margin-left: 20px;
  // Remove ::marker in beginning of list.
  &::marker {
    content: '';
  }
`;

const ListItem = styled(AccountDialogSubtitle)`
  font-weight: 400;
  line-height: 18px;
  color: rgba(var(--rlm-text-rgba), 0.4);
`;

type Props = {
  patp: string | null;
  onUploadFile: (file: File) => Promise<string | undefined>;
  onBack: () => void;
  onNext: (
    username: string,
    description?: string,
    avatarSrc?: string
  ) => Promise<boolean>;
};

export const PassportDialog = ({
  patp,
  onUploadFile,
  onBack,
  onNext,
}: Props) => {
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [avatarSrc, setAvatarSrc] = useState<string>();

  const handleOnNext = () => {
    if (username) return onNext(username, description, avatarSrc);
    return Promise.resolve(false);
  };

  return (
    <OnboardDialog
      body={
        <Flex
          flexDirection="column"
          width="100%"
          maxWidth={402}
          margin="0 auto"
          gap={20}
        >
          <OnboardDialogTitle textAlign="center">
            Create your Passport
          </OnboardDialogTitle>
          <OnboardDialogDescription textAlign="center">
            In Realm, a passport is like an account.
            <br />
            It allows P2P payments, DMs, etc. Make it yours.
          </OnboardDialogDescription>
          {patp ? (
            <PassportCard
              patp={patp}
              username={username}
              description={description}
              setUsername={setUsername}
              setDescription={setDescription}
              setAvatarSrc={setAvatarSrc}
              onUploadFile={onUploadFile}
            />
          ) : (
            <Spinner size={8} />
          )}
          <List>
            <ListItem as="li">Your nickname can be changed later</ListItem>
            <ListItem as="li">
              <Box display="inline-flex" alignItems="center" style={{ gap: 4 }}>
                Select an avatar by clicking on the <AddImageIcon /> icon above
              </Box>
            </ListItem>
          </List>
        </Flex>
      }
      onBack={onBack}
      onNext={handleOnNext}
    />
  );
};
