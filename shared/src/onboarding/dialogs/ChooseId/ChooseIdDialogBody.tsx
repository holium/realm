import { useEffect } from 'react';
import { useFormikContext } from 'formik';

import { Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { IdsPaginated } from './IdsPaginated';

type ChooseIdFields = {
  id: string;
};

type Props = {
  ids: string[];
};

export const ChooseIdDialogBody = ({ ids }: Props) => {
  const {
    values: { id },
    setFieldValue,
  } = useFormikContext<ChooseIdFields>();

  useEffect(() => {
    if (!id && ids.length > 0) {
      setFieldValue('id', ids[0]);
    }
  }, [ids]);

  return (
    <>
      <Flex flexDirection="column" gap={16} marginBottom={30}>
        <OnboardDialogTitle>Choose ID</OnboardDialogTitle>
        <OnboardDialogDescription>
          An ID is like a phone number. It’s how your friends connect with you
          on Realm.
        </OnboardDialogDescription>
      </Flex>
      <IdsPaginated
        ids={ids}
        selectedId={id}
        onSelectId={(id) => setFieldValue('id', id)}
      />
    </>
  );
};
