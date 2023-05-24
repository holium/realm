import { useEffect, useState } from 'react';

import { Flex } from '@holium/design-system/general';

import { OnboardDialog } from '../components/OnboardDialog';
import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../components/OnboardDialog.styles';
import { PatpsPaginated } from '../components/PatpsPaginated';
import { IdentityIcon } from '../icons/IdentityIcon';

type Props = {
  identities: string[];
  onSelectPatp: (patp: string) => void;
  onBack?: () => void;
  onNext: () => Promise<boolean>;
};

export const ChooseIdDialog = ({
  identities,
  onSelectPatp,
  onBack,
  onNext,
}: Props) => {
  const [selectedIdentity, setSelectedIdentity] = useState<string>();

  const handleOnSelectPatp = (patp: string) => {
    onSelectPatp(patp);
    setSelectedIdentity(patp);
  };

  useEffect(() => {
    handleOnSelectPatp(identities[0]);
  }, [identities]);

  return (
    <OnboardDialog
      icon={<IdentityIcon />}
      body={
        <>
          <Flex flexDirection="column" gap={16} marginBottom={30}>
            <OnboardDialogTitle>Choose ID</OnboardDialogTitle>
            <OnboardDialogDescription>
              An ID is like a phone number. It’s how your friends connect with
              you on Realm.
            </OnboardDialogDescription>
          </Flex>
          <PatpsPaginated
            identities={identities}
            selectedIdentity={selectedIdentity}
            onSelectPatp={handleOnSelectPatp}
          />
        </>
      }
      onBack={onBack}
      onNext={onNext}
    />
  );
};
