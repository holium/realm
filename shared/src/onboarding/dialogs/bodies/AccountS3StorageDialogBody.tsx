import { AccountDialogDescription } from '../../components/AccountDialog.styles';
import { AccountDialogTableRow } from '../../components/AccountDialogTableRow';
import { DataSentIndicator } from '../../components/s3-storage/DataSentIndicator';
import { DataStorageIndicator } from '../../components/s3-storage/DataStorageIndicator';
import { S3Password } from '../../components/s3-storage/S3Password';
import { AccountDialogTable } from './AccountHostingDialogBody';

type Props = {
  url: string;
  s3Bucket: string;
  s3Password: string;
  dataStorage: {
    used: number;
    total: number;
  };
  dataSent: {
    networkUsage: number;
    minioUsage: number;
  };
};

export const AccountS3StorageDialogBody = ({
  url,
  s3Bucket,
  s3Password,
  dataStorage,
  dataSent,
}: Props) => (
  <AccountDialogTable>
    <DataStorageIndicator dataStorage={dataStorage} />
    <DataSentIndicator dataSent={dataSent} />
    <AccountDialogTableRow title="URL">
      <AccountDialogDescription flex={1}>{url}</AccountDialogDescription>
    </AccountDialogTableRow>
    <AccountDialogTableRow title="S3 Bucket">
      <AccountDialogDescription flex={1}>{s3Bucket}</AccountDialogDescription>
    </AccountDialogTableRow>
    <S3Password s3Password={s3Password} />
  </AccountDialogTable>
);
