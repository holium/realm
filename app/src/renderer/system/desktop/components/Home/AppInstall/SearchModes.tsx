import { useEffect, useState } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import moment from 'moment';
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
  const { searchMode, searchString, selectedShip, selectedDesk } =
    useAppInstaller();

  useEffect(() => {
    if (searchMode === 'dev-app-search' && selectedShip) {
      if (!bazaarStore.hasAlly(selectedShip)) {
        if (!bazaarStore.alliesLoader.isLoading) {
          // prevents UI crash
          bazaarStore.addAlly(selectedShip).catch((e) => console.error(e));
        }
      } else {
        bazaarStore.scryTreaties(selectedShip).catch((e) => console.error(e));
        // bazaarStore.setLoadingState('published-apps-loaded');
      }
    }
  }, [searchMode, selectedShip]);

  useEffect(() => {
    if (selectedShip && bazaarStore.alliesLoader.isLoaded) {
      bazaarStore.scryTreaties(selectedShip).catch((e) => console.error(e));
    }
  }, [bazaarStore.alliesLoader]);

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
      {searchMode === 'dev-app-search' && <DevAppSearch />}
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
        <Flex flexDirection="column" gap={12}>
          {renderDevs(bazaarStore.recentDevs, appInstaller)}
        </Flex>
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

const renderDevs = (
  devs: any,
  appInstaller: ReturnType<typeof useAppInstaller>
) => {
  if (!devs || devs.length === 0) {
    return <Text.Custom opacity={0.4}>{`No recent devs`}</Text.Custom>;
  }
  const onProviderClick = (ship: string) => {
    if (isValidPatp(ship)) {
      appInstaller.setSearchMode('dev-app-search');
      appInstaller.setSearchPlaceholder('Search...');
      appInstaller.setSelectedShip(ship);
      appInstaller.setSearchModeArgs([ship]);
      appInstaller.setSearchString('');
    }
  };

  return devs?.map((item: any, index: number) => {
    return (
      <ProviderRow
        key={`provider-${index}`}
        id={`provider-${index}`}
        ship={item}
        color={'#000'}
        onClick={(ship: string) => {
          onProviderClick(ship);
        }}
      />
    );
  });
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
    bazaarStore.getAllies() && (
      <>
        {bazaarStore
          .getAllies()
          .filter((item: any) => {
            return item.ship && item.ship.startsWith(appInstaller.searchString);
          })
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

const DevAppsPresenter = () => {
  const { bazaarStore } = useShipStore();
  const {
    searchString,
    selectedShip,
    setSelectedShip,
    setSearchString,
    setSearchMode,
    setApp,
  } = useAppInstaller();

  if (bazaarStore.treatyLoader.isLoading) {
    const ally = bazaarStore.getAlly(selectedShip);
    let takingTooLong = false;
    if (
      ally &&
      !ally?.desks.loadedAt &&
      moment(ally.desks.requestedAt).diff(moment(), 'minutes') < -5
    ) {
      takingTooLong = true;
    }
    return (
      <Flex col>
        <Flex flex={1} verticalAlign="middle">
          <Spinner size={0} />
          <Text.Custom marginLeft={2} opacity={0.4}>
            {`Loading published apps...`}{' '}
          </Text.Custom>
        </Flex>
        {takingTooLong && (
          <>
            <Text.Custom marginTop={3} opacity={0.4}>
              {`This is taking longer than expected. The app publisher may be offline.`}
            </Text.Custom>
            <Flex row justify="center" width="100%">
              <Button.TextButton
                marginTop={2}
                color="intent-alert"
                onClick={() => {
                  setSearchMode('none');
                  setSearchString('');
                  bazaarStore.removeAlly(selectedShip);
                  setSelectedShip('');
                }}
              >
                Cancel
              </Button.TextButton>
            </Flex>
          </>
        )}
      </Flex>
    );
  }

  const InstallButtonPresenter = ({ app }: any) => {
    const { bazaarStore } = useShipStore();
    const parts = app.id.split('/');
    let appEntry;
    let installed = false;
    if (bazaarStore.catalog.has(parts[1])) {
      appEntry = bazaarStore.catalog.get(parts[1]) as AppMobxType;
      installed = appEntry.installStatus === 'installed';
    }
    return (
      <Button.Primary
        borderRadius={6}
        paddingTop="6px"
        paddingBottom="6px"
        disabled={installed}
        fontWeight={500}
        onClick={(e) => {
          e.stopPropagation();
          !installed && bazaarStore.installApp(parts[0], parts[1]);
          // TODO should we close app search on install?
          setSearchMode('none');
        }}
      >
        {appEntry?.installStatus === 'started' ? (
          <Spinner size={0} color="white" />
        ) : installed ? (
          'Installed'
        ) : (
          'Install'
        )}
      </Button.Primary>
    );
  };
  const InstallButton = observer(InstallButtonPresenter);

  const apps: DocketAppType[] = bazaarStore.searchTreaties(
    selectedShip,
    searchString
  );

  if (!apps || apps.length === 0) {
    return <Text.Custom opacity={0.4}>{`No apps found`}</Text.Custom>;
  }

  const onAppClick = (app: DocketAppType) => {
    setApp(app);
    setSearchMode('app-summary');
  };

  return (
    <>
      {apps?.map((app: DocketAppType, index: number) => (
        <div key={index}>
          <AppRow
            app={app}
            actionRenderer={(app: DocketAppType) =>
              app.id && <InstallButton app={app} />
            }
            onClick={(
              evt: React.MouseEvent<HTMLElement>,
              app: DocketAppType
            ) => {
              evt.stopPropagation();
              onAppClick(app);
              setSelectedShip(app.id.split('/')[0]);
              // setSearchModeArgs([app.host, app.id]);
              setSearchString(app.id.split('/')[1]);
              // setApp(app);
              // setSearchMode('app-summary');
              // setSelectedShip(selectedShip);
              // setSearchModeArgs([selectedShip]);
              // setSearchString(app.id);
            }}
          />
        </div>
      ))}
    </>
  );
};

const DevApps = observer(DevAppsPresenter);

const DevAppSearchPresenter = () => {
  const { selectedShip } = useAppInstaller();

  return (
    <Flex flexDirection="column" gap={12}>
      <Text.Custom
        fontWeight={500}
        opacity={0.7}
      >{`Software developed by ${selectedShip}...`}</Text.Custom>
      <Flex flexDirection="column" gap={12}>
        <DevApps />
      </Flex>
    </Flex>
  );
};

const DevAppSearch = observer(DevAppSearchPresenter);
