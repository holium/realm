import { Flex, ProgressBar, Text } from '@holium/design-system';
import { OnboardDialogSubTitle } from '../OnboardDialog.styles';
import { bytesToString } from '../../dialogs/util/bytes';

type Props = {
  dataSent: {
    networkUsage: number;
    minioUsage: number;
  };
};

export const DataSentIndicator = ({ dataSent }: Props) => {
  const { networkUsage, minioUsage } = dataSent;

  const totalBytes = 214748364800; // 200Gb
  const networkPercent = ((networkUsage * 1024 * 1024) / totalBytes) * 100;
  const minioPercent = ((minioUsage * 1024 * 1024) / totalBytes) * 100;
  const networkBytes = networkUsage * 1024 * 1024;
  const minioBytes = minioUsage * 1024 * 1024;

  return (
    <Flex flexDirection="column" gap={8} my={3}>
      <OnboardDialogSubTitle>Monthly Data Sent</OnboardDialogSubTitle>
      <ProgressBar
        progressColors={['intent-alert', 'intent-success']}
        percentages={[networkPercent, minioPercent]}
      />
      <Text.Body display="flex" justifyContent="center" style={{ gap: 3 }}>
        <Text.Body color="intent-success">
          {bytesToString(Number(networkBytes))} (ship data)
        </Text.Body>
        and
        <Text.Body color="intent-alert">
          {bytesToString(Number(minioBytes))} (S3 data)
        </Text.Body>
        of {bytesToString(totalBytes)}.
      </Text.Body>
    </Flex>
  );
};
