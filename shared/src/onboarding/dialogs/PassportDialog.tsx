import { useEffect, useState } from 'react';
import { Box, Flex, Spinner } from '@holium/design-system/general';
import styled from 'styled-components';

import { AccountDialogSubtitle } from '../components/AccountDialog.styles';
import { OnboardDialog } from '../components/OnboardDialog';
import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../components/OnboardDialog.styles';
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
  patp: string;
  loading?: boolean;
  prefilledColor?: string;
  prefilledNickname: string;
  prefilledDescription: string;
  prefilledAvatarSrc: string;
  onUploadFile: (file: File) => Promise<string | undefined>;
  onBack: () => void;
  onNext: (
    nickname: string,
    description?: string,
    avatarSrc?: string
  ) => Promise<boolean>;
};

export const PassportDialog = ({
  patp,
  loading = false,
  prefilledColor = '#000000',
  prefilledNickname,
  prefilledDescription,
  prefilledAvatarSrc,
  onUploadFile,
  onBack,
  onNext,
}: Props) => {
  const [nickname, setNickname] = useState(prefilledNickname);
  const [description, setDescription] = useState(prefilledDescription);
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>();

  useEffect(() => {
    if (!loading) {
      setNickname(prefilledNickname);
      setDescription(prefilledDescription);
      setAvatarSrc(prefilledAvatarSrc);
    }
  }, [loading]);

  const handleOnNext = () => {
    if (nickname) return onNext(nickname, description, avatarSrc);
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
          {loading ? (
            <Flex row align="center" justify="center">
              <Spinner size={5} />
            </Flex>
          ) : (
            <>
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
                  color={prefilledColor}
                  nickname={nickname}
                  description={description}
                  initialAvatarSrc={prefilledAvatarSrc}
                  setNickname={setNickname}
                  setDescription={setDescription}
                  setAvatarSrc={setAvatarSrc}
                  onUploadFile={onUploadFile}
                />
              ) : (
                <Flex flex={1} justifyContent="center">
                  <Spinner size={8} />
                </Flex>
              )}
              <List>
                <ListItem as="li">Your nickname can be changed later</ListItem>
                <ListItem as="li">
                  <Box
                    display="inline-flex"
                    alignItems="center"
                    style={{ gap: 4 }}
                  >
                    Select an avatar by clicking on the <AddImageIcon /> icon
                    above
                  </Box>
                </ListItem>
              </List>
            </>
          )}
        </Flex>
      }
      onBack={onBack}
      onNext={handleOnNext}
    />
  );
};
