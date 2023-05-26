import { useEffect } from 'react';
import { useFormikContext } from 'formik';

import { Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { IdentitiesPaginated } from './IdentitiesPaginated';

type ChooseIdFields = {
  id: string;
};

type Props = {
  identities: string[];
};

export const ChooseIdentityDialogBody = ({ identities }: Props) => {
  const {
    values: { id },
    setFieldValue,
  } = useFormikContext<ChooseIdFields>();

  useEffect(() => {
    if (!id && identities.length > 0) {
      setFieldValue('id', identities[0]);
    }
  }, [identities]);

  return (
    <>
      <Flex flexDirection="column" gap={16} marginBottom={30}>
        <OnboardDialogTitle>Choose ID</OnboardDialogTitle>
        <OnboardDialogDescription>
          An ID is like a phone number. It’s how your friends connect with you
          on Realm.
        </OnboardDialogDescription>
      </Flex>
      <IdentitiesPaginated
        identities={identities}
        selectedId={id}
        onSelectId={(id) => setFieldValue('id', id)}
      />
    </>
  );
};
