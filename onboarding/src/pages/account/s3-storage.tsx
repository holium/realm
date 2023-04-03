import { useEffect, useState } from 'react';
import { AccountS3StorageDialog } from '@holium/shared';
import { Page } from '../../components/Page';
import { api, GetUserS3InfoResponse } from '../../util/api';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';
import { UserContextProvider, useUser } from '../../util/UserContext';

const S3StoragePresenter = () => {
  const { goToPage, logout } = useNavigation();
  const { token, ships, selectedPatp, setSelectedPatp } = useUser();

  const [s3Info, setS3Info] = useState<GetUserS3InfoResponse>();
  const [networkUsage, setNetworkUsage] = useState<number>(0);
  const [minioUsage, setMinioUsage] = useState<number>(0);

  const onClickSidebarSection = (section: string) => {
    goToPage(accountPageUrl[section]);
  };

  useEffect(() => {
    const selectedShip = ships.find((ship) => ship.patp === selectedPatp);

    if (!selectedShip) return;

    api.getUserS3Info(token, selectedShip.id.toString()).then(setS3Info);

    api
      .getUserResourceHistory(token, selectedShip.id.toString())
      .then((response) => {
        setNetworkUsage(response.networkUsage?.network_sent_total ?? 0);
        setMinioUsage(response.networkUsage?.minio_sent_total ?? 0);
      });
  }, []);

  return (
    <AccountS3StorageDialog
      patps={ships.map((ship) => ship.patp)}
      selectedPatp={selectedPatp}
      setSelectedPatp={setSelectedPatp}
      url={s3Info?.consoleUrl}
      s3Bucket={s3Info?.userName}
      s3Password={s3Info?.code}
      dataStorage={{
        used: Number(s3Info?.storageUsed),
        total: Number(s3Info?.storageCapacity),
      }}
      dataSent={{ networkUsage, minioUsage }}
      onClickSidebarSection={onClickSidebarSection}
      onExit={logout}
    />
  );
};

export default function S3Storage() {
  return (
    <Page title="Account / S3 Storage" isProtected>
      <UserContextProvider>
        <S3StoragePresenter />
      </UserContextProvider>
    </Page>
  );
}
