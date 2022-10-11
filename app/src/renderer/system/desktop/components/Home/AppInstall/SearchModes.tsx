import { FC, useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { isValidPatp } from 'urbit-ob';

import { darken, rgba } from 'polished';
import {
  Input,
  Flex,
  Box,
  Text,
  Icons,
  Sigil,
  Button,
  Spinner,
  Card,
} from 'renderer/components';
import { AppRow } from './AppRow';
import { ProviderRow } from './ProviderRow';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { InstallStatus, UrbitAppType } from 'os/services/spaces/models/bazaar';
import { useAppInstaller } from './store';
import { useServices } from 'renderer/logic/store';

export const SearchModes: FC = observer(() => {
  const { spaces, bazaar, theme } = useServices();
  const spacePath: string = spaces.selected?.path!;

  const appInstaller = useAppInstaller();
  const [data, setData] = useState<any>([]);
  const searchMode = appInstaller.searchMode;
  const searchString = appInstaller.searchString;
  const searchModeArgs = appInstaller.searchModeArgs;
  const selectedShip = appInstaller.selectedShip;
  const selectedDesk = appInstaller.selectedDesk;
  const loadingState = appInstaller.loadingState;

  const textFaded = useMemo(
    () => rgba(theme.currentTheme.textColor, 0.7),
    [theme.currentTheme.textColor]
  );

  const secondaryTextColor = useMemo(
    () => rgba(theme.currentTheme.textColor, 0.5),
    [theme.currentTheme.textColor]
  );

  useEffect(() => {
    if (searchMode === 'dev-app-search' && selectedShip) {
      if (!bazaar.hasAlly(selectedShip)) {
        if (loadingState !== 'loading-published-apps') {
          appInstaller.setLoadingState('loading-published-apps');
          SpacesActions.addAlly(selectedShip)
            .then((result) => {
              // console.log('addAlly response => %o', result);
              const treaties = bazaar.getTreaties(selectedShip);
              setData(treaties);
            })
            .catch((e) => console.error(e))
            .finally(() => appInstaller.setLoadingState(''));
        }
      } else {
        const treaties = bazaar.getTreaties(selectedShip);
        // console.log('treaties => %o', treaties);
        setData(treaties);
      }
    }
  }, [searchMode, selectedShip, bazaar.treatyAdded]);

  useEffect(() => {
    if (searchMode === 'app-search') {
      const apps = bazaar.searchApps(searchString);
      setData(apps);
    } else if (searchMode === 'dev-app-search') {
      const apps = bazaar.searchTreaties(selectedShip, searchString);
      setData(apps);
    }
  }, [searchString]);

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
  }, [searchMode]);

  const InstallButton = ({ app }: any) => {
    const parts = app.id.split('/');
    let appEntry;
    let installed = false;
    if (bazaar.apps.has(parts[1])) {
      appEntry = bazaar.apps.get(parts[1]) as UrbitAppType;
      installed = appEntry.installStatus === 'installed';
    }
    return (
      <Button
        data-close-tray={!installed ? 'true' : 'false'}
        borderRadius={6}
        paddingTop="6px"
        paddingBottom="6px"
        variant={installed ? 'disabled' : 'minimal'}
        fontWeight={500}
        onClick={(e) => {
          e.stopPropagation();
          !installed && SpacesActions.installDesk(parts[0], parts[1]);
        }}
      >
        {installed ? 'Installed' : 'Install'}
      </Button>
    );
  };

  // // based on this info, should be "safe" to recreate functions with each render
  // //  https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render
  const appActionRenderer = (app: any) => {
    if (!app.id) return;
    //  treaties consist of <ship>/<desk> keys. parse to get app id value (desk)
    // const appId = app.id.split('/')[1];
    return <InstallButton app={app} />;
  };
  const onProviderClick = (ship: string) => {
    if (isValidPatp(ship)) {
      appInstaller.setSearchMode('dev-app-search');
      appInstaller.setSearchPlaceholder('Search...');
      appInstaller.setSelectedShip(ship);
      appInstaller.setSearchModeArgs([ship]);
      appInstaller.setSearchString('');
    }
  };

  const renderDevApps = (
    ship: string,
    loadingState: string,
    apps: Array<any>
  ) => {
    if (loadingState === 'loading-published-apps') {
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
    if (!apps || apps.length === 0) {
      return <Text color={secondaryTextColor}>{`No apps found`}</Text>;
    }
    // console.log('rendering apps => %o', apps);
    return apps?.map((app, index) => (
      <div key={index}>
        <AppRow
          caption={app.title}
          app={app}
          actionRenderer={(app: any) => appActionRenderer(app)}
          // onClick={(app: any) => {
          //   setData(app);
          //   setSearchMode('app-summary');
          // }}
        />
      </div>
    ));
  };
  const renderDevAppSearch = (
    ship: string,
    loadingState: string,
    data: Array<any>
  ) => {
    return (
      <Flex flexDirection="column" gap={12}>
        <Text
          fontWeight={500}
          color={textFaded}
        >{`Software developed by ${ship}...`}</Text>
        <Flex flexDirection="column" gap={12}>
          {renderDevApps(ship, loadingState, data)}
        </Flex>
      </Flex>
    );
  };

  const renderStart = (space: string, bazaar: any, theme: any) => {
    return (
      <>
        <Flex flexDirection="column" gap={12}>
          <Text color={textFaded} fontWeight={500}>
            Recent Apps
          </Text>
          <Flex flexDirection="column" gap={12}>
            {renderApps(space, bazaar.getRecentApps(space), theme)}
          </Flex>
        </Flex>
        <div style={{ marginTop: '16px', marginBottom: '16px' }}>
          <hr
            style={{
              backgroundColor: rgba(theme.iconColor, 0.1),
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
            {renderDevs(space, bazaar.getRecentDevs(space), theme)}
          </Flex>
        </Flex>
      </>
    );
  };

  return (
    <>
      {searchMode === 'start' &&
        renderStart(spacePath, bazaar, theme.currentTheme)}
      {searchMode === 'ship-search' &&
        renderShipSearch(data, theme.currentTheme, onProviderClick)}
      {searchMode === 'dev-app-search' &&
        renderDevAppSearch(searchModeArgs[0], loadingState, data)}
      {searchMode === 'app-search' && renderAppSearch(data, theme.currentTheme)}
      {searchMode === 'app-summary' && renderAppSummary(data)}
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

  // const onAppsAction = (path: string, app: any, tag: any, rank: number) => {
  //   console.log('onAppsAction => %o', { path, id: app.id, tag });
  //   SpacesActions.addToSuite(path, app.id, rank);
  // };
  return installedApps.map((app: any, index: number) => (
    <div key={index}>
      <AppRow
        caption={app.title}
        app={app}
        onClick={(app: any) => {}}
        // actionRenderer={() => actionRenderer(space, app)}
        // onClick={(e, action, app) => onAppsAction(space, action, app)}
      />
    </div>
  ));
};
const installApp = (app: any) => {
  const tokens = app.id.split('/');
  SpacesActions.installDesk(tokens[0], tokens[1]);
};

const renderAppSummary = (app: any) => {
  return (
    <Flex height={450} flexDirection="column" gap={10}>
      <Text fontWeight={'bold'}>{app.title}</Text>
      <Button onClick={(e) => installApp(app)}>Install</Button>
    </Flex>
  );
};

const renderDevs = (space: string, devs: any, theme: any) => {
  const secondaryTextColor = rgba(theme.textColor, 0.4);

  if (!devs || devs.length === 0) {
    return <Text color={secondaryTextColor}>{`No recent devs`}</Text>;
  }
  return devs?.map((item: any, index: number) => (
    <div key={index}>
      <AppRow
        caption={item.title}
        app={item}
        // actionRenderer={() => actionRenderer(space, item)}
        onClick={(app: any) => {
          console.log('renderDevs', app);
        }}
      />
    </div>
  ));
};
const renderAppSearch = (apps: any, theme: any) => {
  return (
    <>
      <Flex flexDirection="column" gap={10}>
        <Text fontWeight={'bold'}>{`Installed Apps`}</Text>
        {renderApps('', apps, theme)}
      </Flex>
    </>
  );
};

const AppProviders: FC<any> = observer(
  (props: {
    data: any;
    onProviderClick: (ship: string) => void;
    children: any;
  }) => {
    const { searchString } = useAppInstaller();
    const { data, onProviderClick } = props;
    return (
      data &&
      data
        .filter((item: any) => item.ship && item.ship.startsWith(searchString))
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
        ))
    );
  }
);
const renderShipSearch = (
  data: Array<any>,
  theme: any,
  onProviderClick: (ship: string) => void
) => {
  return (
    <Flex flexDirection="column" gap={12}>
      <Text color={rgba(theme.textColor, 0.7)} fontWeight={500}>
        Searching Software Providers
      </Text>
      <Flex flexDirection="column" gap={2}>
        <AppProviders data={data} onProviderClick={onProviderClick} />
      </Flex>
    </Flex>
  );
};
