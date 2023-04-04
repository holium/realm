import { useEffect, useState } from 'react';
import { Flex } from '@holium/design-system';
import { IdentityIcon } from '../icons/IdentityIcon';
import {
  OnboardDialogTitle,
  OnboardDialogDescription,
} from '../components/OnboardDialog.styles';
import { PatpsPaginated } from '../components/PatpsPaginated';
import { OnboardDialog } from '../components/OnboardDialog';

type Props = {
  patps: string[];
  onSelectPatp: (patp: string) => void;
  onNext: () => Promise<boolean>;
};

export const ChooseIdDialog = ({ patps, onSelectPatp, onNext }: Props) => {
  const [selectedPatp, setSelectedPatp] = useState<string>();

  const handleOnSelectPatp = (patp: string) => {
    onSelectPatp(patp);
    setSelectedPatp(patp);
  };

  useEffect(() => {
    handleOnSelectPatp(patps[0]);
  }, [patps]);

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
            patps={patps}
            selectedPatp={selectedPatp}
            onSelectPatp={handleOnSelectPatp}
          />
        </>
      }
      onNext={onNext}
    />
  );
};
