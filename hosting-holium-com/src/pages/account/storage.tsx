import { useEffect, useState } from 'react';

import {
  AccountStorageDialog,
  UserContextProvider,
  useUser,
} from '@holium/shared';

import { Page } from '../../components/Page';
import { thirdEarthApi } from '../../util/thirdEarthApi';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

type GetUserS3InfoResponse = Awaited<
  ReturnType<typeof thirdEarthApi.getUserStorageInfo>
>;

const S3StoragePresenter = () => {
  const { goToPage, logout } = useNavigation();
  const { token, ships, selectedIdentity, setSelectedIdentity } = useUser();

  const [s3Info, setS3Info] = useState<GetUserS3InfoResponse>();
  const [networkUsage, setNetworkUsage] = useState<number>(0);
  const [minioUsage, setMinioUsage] = useState<number>(0);

  const onClickSidebarSection = (section: string) => {
    goToPage(accountPageUrl[section]);
  };

  const onClickBuyIdentity = () => {
    goToPage(accountPageUrl['Get Hosting'], {
      back_url: accountPageUrl['Storage'],
    });
  };

  useEffect(() => {
    const selectedShip = ships.find((ship) => ship.patp === selectedIdentity);

    if (!token) return;
    if (!selectedShip) return;

    thirdEarthApi
      .getUserStorageInfo(token, selectedShip.id.toString())
      .then(setS3Info);

    thirdEarthApi
      .getUserResourceHistory(token, selectedShip.id.toString())
      .then((response) => {
        setNetworkUsage(response.networkUsage?.network_sent_total ?? 0);
        setMinioUsage(response.networkUsage?.minio_sent_total ?? 0);
      });
  }, [token, ships, selectedIdentity]);

  return (
    <AccountStorageDialog
      identities={ships.map((ship) => ship.patp)}
      selectedIdentity={selectedIdentity}
      setSelectedIdentity={setSelectedIdentity}
      storageUrl={s3Info?.consoleUrl}
      storageBucket={s3Info?.userName}
      storagePassword={s3Info?.code}
      dataStorage={{
        used: Number(s3Info?.storageUsed),
        total: Number(s3Info?.storageCapacity),
      }}
      dataSent={{ networkUsage, minioUsage }}
      onClickBuyIdentity={onClickBuyIdentity}
      onClickSidebarSection={onClickSidebarSection}
      onExit={logout}
    />
  );
};

export default function S3Storage() {
  return (
    <Page title="Account / Storage" isProtected>
      <UserContextProvider api={thirdEarthApi}>
        <S3StoragePresenter />
      </UserContextProvider>
    </Page>
  );
}
