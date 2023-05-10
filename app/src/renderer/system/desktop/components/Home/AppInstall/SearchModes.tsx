import { useEffect, useState } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { isValidPatp } from 'urbit-ob';

import {
  Button,
  Flex,
  InstallStatus,
  NoScrollBar,
  Spinner,
  Text,
} from '@holium/design-system';

import { AppDetailDialog } from 'renderer/apps/System/Dialogs/AppDetail';
import { appState } from 'renderer/stores/app.store';
import {
  AppMobxType,
  DocketAppType,
} from 'renderer/stores/models/bazaar.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { AppRow } from './AppRow';
import { ProviderRow } from './ProviderRow';
import { useAppInstaller } from './store';

const SearchModesPresenter = () => {
  const { bazaarStore } = useShipStore();
  const [data, setData] = useState<any>([]);
  const {
    searchMode,
    searchString,
    selectedShip,
    selectedDesk,
    loadingState,
    setLoadingState,
  } = useAppInstaller();

  useEffect(() => {
    if (searchMode === 'dev-app-search' && selectedShip) {
      bazaarStore
        .scryTreaties(selectedShip)
        .catch((e) => console.error(e))
        .finally(() => setLoadingState(''));
    }
  }, [bazaarStore.treatiesLoaded, searchMode, selectedShip, setLoadingState]);

  useEffect(() => {
    if (searchMode === 'dev-app-search' && selectedShip) {
      if (!bazaarStore.hasAlly(selectedShip)) {
        if (loadingState !== 'loading-published-apps') {
          setLoadingState('loading-published-apps');
          bazaarStore
            .addAlly(selectedShip)
            .then(() => {
              bazaarStore.scryTreaties(selectedShip);
            })
            .catch((e) => console.error(e));
          // .finally(() => appInstaller.setLoadingState(''));
        }
      } else {
        bazaarStore.scryTreaties(selectedShip);
      }
    }
  }, [bazaarStore, loadingState, searchMode, selectedShip, setLoadingState]);

  useEffect(() => {
    if (searchMode === 'app-search') {
      const apps = bazaarStore.searchApps(searchString);
      setData(apps);
    } else if (searchMode === 'dev-app-search') {
      const apps = bazaarStore.searchTreaties(selectedShip, searchString);
      setData(apps);
    }
  }, [bazaarStore, searchMode, searchString, selectedShip]);

  useEffect(() => {
    if (searchMode === 'ship-search') {
      setData([]);
      const allies = bazaarStore.getAllies();
      setData(allies);
    } else if (searchMode === 'dev-app-detail') {
      setData([]);
      const treaty = bazaarStore.getTreaty(selectedShip, selectedDesk);
      if (treaty) {
        setData([treaty]);
      }
    }
  }, [bazaarStore, searchMode, selectedDesk, selectedShip]);

  return (
    <>
      {searchMode === 'start' && <AppInstallStart />}
      {searchMode === 'ship-search' && <ShipSearch />}
      {searchMode === 'app-search' && renderAppSearch(data)}
      {searchMode === 'app-summary' && renderAppSummary()}
    </>
  );
};

export const SearchModes = observer(SearchModesPresenter);

const AppInstallStartPresenter = () => {
  const { bazaarStore } = useShipStore();
  const appInstaller = useAppInstaller();

  return (
    <NoScrollBar flexDirection="column">
      <Flex flexDirection="column" gap={12}>
        <Text.Custom opacity={0.7} fontWeight={500}>
          Recent Apps
        </Text.Custom>
        <Flex flexDirection="column" gap={12}>
          {renderApps(bazaarStore.getRecentApps() as AppMobxType[])}
        </Flex>
      </Flex>
      <div style={{ marginTop: '16px', marginBottom: '16px' }}>
        <hr
          style={{
            backgroundColor: 'rgba(var(--rlm-icon-rgba), 0.1)',
            height: '1px',
            border: 0,
          }}
        />
      </div>
      <Flex flexDirection="column" gap={12}>
        <Text.Custom opacity={0.7} fontWeight={500}>
          Recent Developers
        </Text.Custom>
      </Flex>
    </NoScrollBar>
  );
};

const AppInstallStart = observer(AppInstallStartPresenter);

const renderApps = (apps: AppMobxType[]) => {
  if (!apps || apps.length === 0) {
    return <Text.Custom opacity={0.4}>{`No apps found`}</Text.Custom>;
  }

  const installedApps = apps?.filter(
    (app: any) =>
      app &&
      (app.type !== 'urbit' || app.installStatus === InstallStatus.installed)
  );
  if (!installedApps || installedApps.length === 0) {
    return <Text.Custom opacity={0.4}>{`No apps found`}</Text.Custom>;
  }

  return installedApps.map((app: any, index: number) => (
    <AppRow
      key={index}
      app={app}
      descriptionWidth={450}
      onClick={() => {
        appState.shellStore.openWindow(toJS(app));
        appState.shellStore.closeHomePane();
      }}
    />
  ));
};

const renderAppSummary = () => {
  const ViewComponent = AppDetailDialog({
    type: 'app-install',
    loading: false,
  }).component;
  return <ViewComponent />;
};

const renderAppSearch = (apps: AppMobxType[]) => {
  return (
    <Flex flexDirection="column" gap={12}>
      <Text.Custom fontWeight={500} mb={1}>
        Installed Apps
      </Text.Custom>
      {renderApps(apps)}
    </Flex>
  );
};

const AppProvidersPresenter = () => {
  const appInstaller = useAppInstaller();
  const { bazaarStore } = useShipStore();
  const onProviderClick = (ship: string) => {
    if (isValidPatp(ship)) {
      appInstaller.setSearchMode('dev-app-search');
      appInstaller.setSearchPlaceholder('Search...');
      appInstaller.setSelectedShip(ship);
      appInstaller.setSearchModeArgs([ship]);
      appInstaller.setSearchString('');
      bazaarStore.addRecentDev(ship);
    }
  };
  return (
    bazaarStore.allies && (
      <>
        {Array.from(bazaarStore.allies.values())
          .filter(
            (item: any) =>
              item.ship && item.ship.startsWith(appInstaller.searchString)
          )
          .map((item: any, index: number) => (
            <ProviderRow
              key={`provider-${index}`}
              id={`provider-${index}`}
              ship={item.ship}
              color={item.sigilColor}
              onClick={(ship: string) => {
                onProviderClick(ship);
              }}
            />
          ))}
      </>
    )
  );
};

const AppProviders = observer(AppProvidersPresenter);

const ShipSearchPresenter = () => {
  return (
    <Flex flexDirection="column" gap={12}>
      <Text.Custom opacity={0.7} fontWeight={500}>
        Searching Software Providers
      </Text.Custom>
      <Flex flexDirection="column" gap={2}>
        <AppProviders />
      </Flex>
    </Flex>
  );
};

const ShipSearch = observer(ShipSearchPresenter);
