import { Flex, ProgressBar, Text } from '@holium/design-system/general';

import { OnboardDialogSubTitle } from '../../components/OnboardDialog.styles';
import { bytesToString } from '../util';

type Props = {
  dataStorage: {
    used: number;
    total: number;
  };
};

export const DataStorageIndicator = ({ dataStorage }: Props) => {
  const storageUsedPercentage = (dataStorage.used / dataStorage.total) * 100;

  return (
    <Flex flexDirection="column" gap={8}>
      <OnboardDialogSubTitle>Storage Capacity</OnboardDialogSubTitle>
      <ProgressBar
        progressColors={['intent-success']}
        percentages={[storageUsedPercentage]}
      />
      <Text.Body color="intent-success" textAlign="center">
        {bytesToString(dataStorage.used)} of {bytesToString(dataStorage.total)}
      </Text.Body>
    </Flex>
  );
};
