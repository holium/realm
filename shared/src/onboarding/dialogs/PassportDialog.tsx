import { useState } from 'react';
import styled from 'styled-components';
import { Flex, Box } from '@holium/design-system/general';
import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../components/OnboardDialog.styles';
import { OnboardDialog } from '../components/OnboardDialog';
import { AccountDialogSubtitle } from '../components/AccountDialog.styles';
import { PassportCard } from '../components/PassportCard';
import { AddImageIcon } from '../icons/AddImageIcon';

const List = styled.li`
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
  patp: string;
  onBack: () => void;
  onNext: (
    username: string,
    description?: string,
    avatarSrc?: string
  ) => Promise<boolean>;
};

export const PassportDialog = ({ patp, onBack, onNext }: Props) => {
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
            It allows p2p payments, DMs, etc. Make it yours.
          </OnboardDialogDescription>
          <PassportCard
            patp={patp}
            username={username}
            description={description}
            setUsername={setUsername}
            setDescription={setDescription}
            setAvatarSrc={setAvatarSrc}
          />
          <List>
            <ListItem as="li">A username can be changed later</ListItem>
            <ListItem as="li">
              <Box display="inline-flex" alignItems="center" style={{ gap: 4 }}>
                Select an avatar by clicking on the <AddImageIcon /> icon above
              </Box>
            </ListItem>
            <ListItem as="li">
              Your accent color is used throughout Realm
            </ListItem>
          </List>
        </Flex>
      }
      onBack={onBack}
      onNext={handleOnNext}
    />
  );
};
