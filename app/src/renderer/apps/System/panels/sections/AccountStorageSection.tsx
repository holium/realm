import { useEffect, useState } from 'react';

import { AccountStorageDialogBody, useUser } from '@holium/shared';

import { thirdEarthApi } from 'renderer/onboarding/thirdEarthApi';
import { MobXAccount } from 'renderer/stores/models/account.model';

import { SettingSection } from '../../components/SettingSection';

type GetUserStorageInfoResponse = Awaited<
  ReturnType<typeof thirdEarthApi.getUserStorageInfo>
>;

type Props = {
  account: MobXAccount;
};

export const AccountStorageSection = ({ account }: Props) => {
  const { token, ships } = useUser();

  const [storageInfo, setStorageInfo] = useState<GetUserStorageInfoResponse>();
  const [networkUsage, setNetworkUsage] = useState<number>(0);
  const [minioUsage, setMinioUsage] = useState<number>(0);

  useEffect(() => {
    const selectedShip = ships.find((ship) => ship.patp === account.serverId);

    if (!token) return;
    if (!selectedShip) return;

    thirdEarthApi
      .getUserStorageInfo(token, selectedShip.id.toString())
      .then(setStorageInfo);

    thirdEarthApi
      .getUserResourceHistory(token, selectedShip.id.toString())
      .then((response) => {
        setNetworkUsage(response.networkUsage?.network_sent_total ?? 0);
        setMinioUsage(response.networkUsage?.minio_sent_total ?? 0);
      });
  }, [token, ships, account.serverId]);

  return (
    <SettingSection
      title="Storage"
      body={
        <AccountStorageDialogBody
          storageUrl={storageInfo?.consoleUrl ?? ''}
          storageBucket={storageInfo?.userName ?? ''}
          storagePassword={storageInfo?.code ?? ''}
          dataStorage={{
            used: Number(storageInfo?.storageUsed),
            total: Number(storageInfo?.storageCapacity),
          }}
          dataSent={{ networkUsage, minioUsage }}
        />
      }
    />
  );
};
