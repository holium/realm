import { useEffect, useState } from 'react';

import { useToggle } from '@holium/design-system/util';
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
  const { token, ships, selectedShipId, setSelectedShipId } = useUser();

  const loading = useToggle(true);

  const [error, setError] = useState<string>();
  const [s3Info, setS3Info] = useState<GetUserS3InfoResponse>();
  const [networkUsage, setNetworkUsage] = useState<number>(0);
  const [minioUsage, setMinioUsage] = useState<number>(0);

  const onClickSidebarSection = (section: string) => {
    goToPage(accountPageUrl[section]);
  };

  const onClickUploadPier = () => {
    const byopInProgress = ships.find(
      (ship) => ship.product_type === 'byop-p' && ship.ship_type !== 'planet'
    );

    if (byopInProgress) {
      goToPage('/upload-pier', {
        back_url: '/account/storage',
      });
    } else {
      goToPage('/upload-pier-disclaimer', {
        back_url: '/account/storage',
      });
    }
  };

  const onClickPurchaseId = () => {
    goToPage(accountPageUrl['Get Hosting'], {
      back_url: '/account/storage',
    });
  };

  const getAndSetS3Info = async (token: string, shipId: string) => {
    try {
      loading.toggleOn();
      setError(undefined);
      const newS3Info = await thirdEarthApi.getUserStorageInfo(token, shipId);

      if (newS3Info) {
        setS3Info(newS3Info);
        thirdEarthApi.getUserResourceHistory(token, shipId).then((response) => {
          setNetworkUsage(response.networkUsage?.network_sent_total ?? 0);
          setMinioUsage(response.networkUsage?.minio_sent_total ?? 0);
        });
      } else {
        throw new Error();
      }
    } catch {
      setError('No storage set up for this ship.');
      return;
    } finally {
      loading.toggleOff();
    }
  };

  useEffect(() => {
    const selectedShip = ships.find((ship) => ship.id === selectedShipId);

    if (!token) return;
    if (!selectedShip) return;

    getAndSetS3Info(token, selectedShip.id.toString());
  }, [token, ships, selectedShipId]);

  const onClickRestartStorage = () => {
    const selectedShip = ships.find((ship) => ship.id === selectedShipId);

    if (!token) return;
    if (!selectedShip) return;

    return thirdEarthApi.setStorage(token, selectedShip.id.toString());
  };

  return (
    <AccountStorageDialog
      ships={ships}
      selectedShipId={selectedShipId}
      setSelectedShipId={setSelectedShipId}
      storageUrl={s3Info?.consoleUrl}
      storageBucket={s3Info?.userName}
      storagePassword={s3Info?.code}
      dataStorage={{
        used: Number(s3Info?.storageUsed),
        total: Number(s3Info?.storageCapacity),
      }}
      dataSent={{ networkUsage, minioUsage }}
      isLoading={loading.isOn}
      error={error}
      onClickRestartStorage={onClickRestartStorage}
      onClickPurchaseId={onClickPurchaseId}
      onClickUploadPier={onClickUploadPier}
      onClickSidebarSection={onClickSidebarSection}
      onExit={logout}
    />
  );
};

export default function AccountStoragePage() {
  return (
    <Page title="Account / Storage" isProtected>
      <UserContextProvider api={thirdEarthApi}>
        <S3StoragePresenter />
      </UserContextProvider>
    </Page>
  );
}
