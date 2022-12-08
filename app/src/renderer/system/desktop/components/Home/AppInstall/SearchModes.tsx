import { FC, useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { isValidPatp } from 'urbit-ob';
import { rgba } from 'polished';
import { Flex, Text, Button, Spinner } from 'renderer/components';
import { AppRow } from './AppRow';
import { ProviderRow } from './ProviderRow';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import {
  InstallStatus,
  UrbitAppType,
  DocketAppType,
} from 'os/services/spaces/models/bazaar';
import { useAppInstaller } from './store';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { AppDetailDialog } from 'renderer/apps/System/Dialogs/AppDetail';

export const SearchModes = observer(() => {
  const { bazaar, theme } = useServices();
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
      SpacesActions.scryTreaties(selectedShip)
        .catch((e) => console.error(e))
        .finally(() => setLoadingState(''));
    }
  }, [bazaar.treatiesLoaded, searchMode, selectedShip, setLoadingState]);

  useEffect(() => {
    if (searchMode === 'dev-app-search' && selectedShip) {
      if (!bazaar.hasAlly(selectedShip)) {
        if (loadingState !== 'loading-published-apps') {
          setLoadingState('loading-published-apps');
          SpacesActions.addAlly(selectedShip)
            .then(() => {
              // SpacesActions.scryTreaties(selectedShip);
            })
            .catch((e) => console.error(e));
          // .finally(() => appInstaller.setLoadingState(''));
        }
      } else {
        SpacesActions.scryTreaties(selectedShip);
      }
    }
  }, [bazaar, loadingState, searchMode, selectedShip, setLoadingState]);

  useEffect(() => {
    if (searchMode === 'app-search') {
      const apps = bazaar.searchApps(searchString);
      setData(apps);
    } else if (searchMode === 'dev-app-search') {
      const apps = bazaar.searchTreaties(selectedShip, searchString);
      setData(apps);
    }
  }, [bazaar, searchMode, searchString, selectedShip]);

  useEffect(() => {
    if (searchMode === 'ship-search') {
      setData([]);
      const allies = bazaar.getAllies();
      setData(allies);
    } else if (searchMode === 'dev-app-detail') {
      setData([]);
      const treaty = bazaar.getTreaty(selectedShip, selectedDesk);
      if (treaty) {
        setData([treaty]);
      }
    }
  }, [bazaar, searchMode, selectedDesk, selectedShip]);

  return (
    <>
      {searchMode === 'start' && <AppInstallStart />}
      {searchMode === 'ship-search' && <ShipSearch />}
      {searchMode === 'dev-app-search' && <DevAppSearch />}
      {searchMode === 'app-search' && renderAppSearch(data, theme.currentTheme)}
      {searchMode === 'app-summary' && renderAppSummary()}
    </>
  );
});

const AppInstallStart = observer(() => {
  const { bazaar, theme, spaces } = useServices();
  const spacePath: string = spaces.selected?.path!;

  const textFaded = useMemo(
    () => rgba(theme.currentTheme.textColor, 0.7),
    [theme.currentTheme.textColor]
  );
  return (
    <>
      <Flex flexDirection="column" gap={12}>
        <Text color={textFaded} fontWeight={500}>
          Recent Apps
        </Text>
        <Flex flexDirection="column" gap={12}>
          {renderApps(spacePath, bazaar.getRecentApps(), theme.currentTheme)}
        </Flex>
      </Flex>
      <div style={{ marginTop: '16px', marginBottom: '16px' }}>
        <hr
          style={{
            backgroundColor: rgba(theme.currentTheme.iconColor, 0.1),
            height: '1px',
            border: 0,
          }}
        />
      </div>
      <Flex flexDirection="column" gap={12}>
        <Text color={textFaded} fontWeight={500}>
          Recent Developers
        </Text>
        <Flex flexDirection="column" gap={12}>
          {renderDevs(bazaar.getRecentDevs(), theme.currentTheme)}
        </Flex>
      </Flex>
    </>
  );
});

const renderApps = (space: string, apps: any, theme: any) => {
  const secondaryTextColor = rgba(theme.textColor, 0.4);

  if (!apps || apps.length === 0) {
    return <Text color={secondaryTextColor}>{`No apps found`}</Text>;
  }

  const installedApps = apps?.filter(
    (app: any) =>
      app.type !== 'urbit' || app.installStatus === InstallStatus.installed
  );
  if (!installedApps || installedApps.length === 0) {
    return <Text color={secondaryTextColor}>{`No apps found`}</Text>;
  }

  return installedApps.map((app: any, index: number) => (
    <AppRow
      key={index}
      caption={app.title}
      app={app}
      descriptionWidth={450}
      onClick={() => {
        DesktopActions.openAppWindow(space, app);
        DesktopActions.setHomePane(false);
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

const renderDevs = (devs: any, theme: any) => {
  const secondaryTextColor = rgba(theme.textColor, 0.4);

  if (!devs || devs.length === 0) {
    return <Text color={secondaryTextColor}>{`No recent devs`}</Text>;
  }
  return devs?.map((item: any, index: number) => (
    <div key={index}>
      <AppRow
        caption={item.title}
        app={item}
        onClick={(app: any) => {
          console.log('renderDevs', app);
        }}
      />
    </div>
  ));
};
const renderAppSearch = (apps: any, theme: any) => {
  return (
    <Flex flexDirection="column" gap={12}>
      <Text fontWeight={'bold'} mb={1}>
        Installed Apps
      </Text>
      {renderApps('', apps, theme)}
    </Flex>
  );
};

const AppProviders: FC<any> = observer(() => {
  const appInstaller = useAppInstaller();
  const { bazaar } = useServices();
  const onProviderClick = (ship: string) => {
    if (isValidPatp(ship)) {
      appInstaller.setSearchMode('dev-app-search');
      appInstaller.setSearchPlaceholder('Search...');
      appInstaller.setSelectedShip(ship);
      appInstaller.setSearchModeArgs([ship]);
      appInstaller.setSearchString('');
    }
  };
  return (
    bazaar.allies && (
      <>
        {Array.from(bazaar.allies.values())
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
});
const ShipSearch: FC<any> = observer(() => {
  const { theme } = useServices();

  return (
    <Flex flexDirection="column" gap={12}>
      <Text color={rgba(theme.currentTheme.textColor, 0.7)} fontWeight={500}>
        Searching Software Providers
      </Text>
      <Flex flexDirection="column" gap={2}>
        <AppProviders />
      </Flex>
    </Flex>
  );
});

const DevApps = observer(() => {
  const { theme, bazaar } = useServices();
  const {
    searchString,
    selectedShip,
    setSelectedShip,
    setSearchString,
    setSearchMode,
    setApp,
  } = useAppInstaller();

  const secondaryTextColor = useMemo(
    () => rgba(theme.currentTheme.textColor, 0.5),
    [theme.currentTheme.textColor]
  );
  const apps: DocketAppType[] = bazaar.searchTreaties(
    selectedShip,
    searchString
  );

  if (bazaar.loadingTreaties) {
    return (
      <Flex flex={1} verticalAlign="middle">
        <Spinner size={0} />
        <Text
          marginLeft={2}
          color={secondaryTextColor}
        >{`Loading published apps...`}</Text>
      </Flex>
    );
  }

  const InstallButton = ({ app }: any) => {
    const { bazaar } = useServices();
    const parts = app.id.split('/');
    let appEntry;
    let installed = false;
    if (bazaar.catalog.has(parts[1])) {
      appEntry = bazaar.catalog.get(parts[1]) as UrbitAppType;
      installed = appEntry.installStatus === 'installed';
    }
    return (
      <Button
        borderRadius={6}
        paddingTop="6px"
        paddingBottom="6px"
        variant={installed ? 'disabled' : 'minimal'}
        fontWeight={500}
        onClick={(e) => {
          e.stopPropagation();
          !installed && SpacesActions.installApp(parts[0], parts[1]);
          // TODO should we close app search on install?
          setSearchMode('none');
        }}
      >
        {installed ? 'Installed' : 'Install'}
      </Button>
    );
  };

  if (!apps || apps.length === 0) {
    return <Text color={secondaryTextColor}>{`No apps found`}</Text>;
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
            caption={app.title}
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
});

const DevAppSearch: FC = observer(() => {
  const { theme } = useServices();
  const { selectedShip } = useAppInstaller();

  const textFaded = useMemo(
    () => rgba(theme.currentTheme.textColor, 0.7),
    [theme.currentTheme.textColor]
  );

  return (
    <Flex flexDirection="column" gap={12}>
      <Text
        fontWeight={500}
        color={textFaded}
      >{`Software developed by ${selectedShip}...`}</Text>
      <Flex flexDirection="column" gap={12}>
        <DevApps />
      </Flex>
    </Flex>
  );
});
