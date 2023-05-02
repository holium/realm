import { useEffect, useState } from 'react';

import { AccountS3StorageDialogBody, useUser } from '@holium/shared';

import { thirdEarthApi } from 'renderer/onboarding/thirdEarthApi';
import { MobXAccount } from 'renderer/stores/models/account.model';

import { SettingSection } from '../../components/SettingSection';

type GetUserS3InfoResponse = Awaited<
  ReturnType<typeof thirdEarthApi.getUserS3Info>
>;

type Props = {
  account: MobXAccount;
};

export const AccountStorageSection = ({ account }: Props) => {
  const { token, ships } = useUser();

  const [s3Info, setS3Info] = useState<GetUserS3InfoResponse>();
  const [networkUsage, setNetworkUsage] = useState<number>(0);
  const [minioUsage, setMinioUsage] = useState<number>(0);

  useEffect(() => {
    const selectedShip = ships.find((ship) => ship.patp === account.serverId);

    if (!token) return;
    if (!selectedShip) return;

    thirdEarthApi
      .getUserS3Info(token, selectedShip.id.toString())
      .then(setS3Info);

    thirdEarthApi
      .getUserResourceHistory(token, selectedShip.id.toString())
      .then((response) => {
        setNetworkUsage(response.networkUsage?.network_sent_total ?? 0);
        setMinioUsage(response.networkUsage?.minio_sent_total ?? 0);
      });
  }, [token, ships, account.serverId]);

  return (
    <SettingSection
      title="S3 Storage settings"
      body={
        <AccountS3StorageDialogBody
          url={s3Info?.consoleUrl ?? ''}
          s3Bucket={s3Info?.userName ?? ''}
          s3Password={s3Info?.code ?? ''}
          dataStorage={{
            used: Number(s3Info?.storageUsed),
            total: Number(s3Info?.storageCapacity),
          }}
          dataSent={{ networkUsage, minioUsage }}
        />
      }
    />
  );
};
