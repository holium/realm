import { useEffect, useMemo, useState } from 'react';
import { styled as stitch, keyframes } from '@stitches/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { isValidPatp } from 'urbit-ob';
import { observer } from 'mobx-react';
import {
  Input,
  Flex,
  Box,
  Text,
  Icons,
  Sigil,
  Button,
  Spinner,
} from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { AppRow } from './AppRow';
import { ProviderRow } from './ProviderRow';
import { darken, rgba } from 'polished';
import { InstallStatus } from 'os/services/spaces/models/bazaar';

const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideRightAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const slideDownAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideLeftAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});
const StyledContent = stitch(PopoverPrimitive.Content, {
  borderRadius: 6,
  padding: 20,
  width: 500,
  backgroundColor: 'white',
  boxShadow:
    'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  '@media (prefers-reduced-motion: no-preference)': {
    animationDuration: '400ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'transform, opacity',
    '&[data-state="open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
  },
  '&:focus': {
    boxShadow: `hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px, 0 0 0 2px #ababab`,
  },
});

function Content({ children, ...props }) {
  return (
    <PopoverPrimitive.Portal>
      <StyledContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => {
          // @ts-ignore
          document.activeElement?.blur();
          e.preventDefault();
        }}
        onFocusOutside={(e) => e.preventDefault()}
        {...props}
      >
        {children}
      </StyledContent>
    </PopoverPrimitive.Portal>
  );
}

const renderDevs = (space: string, devs: any, theme: any) => {
  const secondaryTextColor = rgba(theme.textColor, 0.4);

  if (!devs || devs.length === 0) {
    return <Text color={secondaryTextColor}>{`No recent devs`}</Text>;
  }
  return devs?.map((item, index) => (
    <div key={index}>
      <AppRow
        caption={item.title}
        app={item}
        // actionRenderer={() => actionRenderer(space, item)}
        // onClick={(e, action, app) => onAppsAction(space, action, app)}
      />
    </div>
  ));
};

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
  return installedApps.map((app, index) => (
    <div key={index}>
      <AppRow
        caption={app.title}
        app={app}
        // actionRenderer={() => actionRenderer(space, app)}
        // onClick={(e, action, app) => onAppsAction(space, action, app)}
      />
    </div>
  ));
};

const renderProviders = (
  data: Array<any>,
  searchString: string,
  onProviderClick: (ship: string) => void
) => {
  return (
    data &&
    data
      .filter((item) => item.ship.startsWith(searchString))
      .map((item, index) => (
        <ProviderRow
          key={`provider-${index}`}
          id={`provider-${index}`}
          ship={item.ship}
          color={item.sigilColor}
          onClick={(ship: string) => onProviderClick(ship)}
        />
      ))
  );
};

const renderStart = (space: string, bazaar: any, theme: any) => {
  return (
    <>
      <Flex flexDirection="column" gap={12}>
        <Text color={rgba(theme.textColor, 0.7)} fontWeight={500}>
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
        <Text color={rgba(theme.textColor, 0.7)} fontWeight={500}>
          Recent Developers
        </Text>
        <Flex flexDirection="column" gap={12}>
          {renderDevs(space, bazaar.getRecentDevs(space), theme)}
        </Flex>
      </Flex>
    </>
  );
};
const renderShipSearch = (
  data: Array<any>,
  searchString: string,
  theme: any,
  onProviderClick: (ship: string) => void
) => {
  return (
    <>
      <Flex flexDirection="column" gap={12}>
        <Text color={rgba(theme.textColor, 0.7)} fontWeight={500}>
          Searching Software Providers
        </Text>
        <Flex flexDirection="column" gap={2}>
          {renderProviders(data, searchString, onProviderClick)}
        </Flex>
      </Flex>
    </>
  );
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

const StyledClose = stitch(PopoverPrimitive.Close, {
  all: 'unset',
  fontFamily: 'inherit',
  borderRadius: '100%',
  height: 25,
  width: 25,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ff0000',
  position: 'absolute',
  top: 5,
  right: 5,

  '&:hover': { backgroundColor: '#ff0000' },
  '&:focus': { boxShadow: `0 0 0 2px #ff0000` },
});

// Exports
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverContent = Content;
export const PopoverClose = StyledClose;
export const PopoverAnchor = PopoverPrimitive.Anchor;

const BazaarAppRow = observer((props) => (
  <div>
    <input
      type="checkbox"
      checked={props.todo.done}
      onChange={(e) => props.todo.toggle()}
    />
    <input
      type="text"
      value={props.todo.name}
      onChange={(e) => props.todo.setName(e.target.value)}
    />
  </div>
));

interface AppSearchProps {}

const AppSearchApp = observer((props: AppSearchProps) => {
  const { spaces, bazaar, theme } = useServices();
  const [data, setData] = useState<any>([]);
  const [searchMode, setSearchMode] = useState('none');
  const [searchModeArgs, setSearchModeArgs] = useState<Array<string>>([]);
  const [searchString, setSearchString] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('Search...');
  const [selectedShip, setSelectedShip] = useState('');
  const [selectedDesk, setSelectedDesk] = useState('');
  const [loadingState, setLoadingState] = useState('');

  const spacePath: string = spaces.selected?.path!;

  const InstallButton = observer((props: any) => {
    console.log('InstallButton => %o', props);
    return (
      <Button
        borderRadius={6}
        disabled={bazaar.isAppInstalled(props.app.id)}
        isLoading={
          props.app.installStatus &&
          [
            InstallStatus.failed,
            InstallStatus.installed,
            InstallStatus.uninstalled,
          ].indexOf(props.app.installStatus) === -1
        }
        onClick={(e) => {
          const tokens = props.app.id.split('/');
          SpacesActions.installDesk(tokens[0], tokens[1])
            .then((result) => console.log(`installApp response => %o`, result))
            .catch((e) => console.error(e))
            .finally(() => {});
        }}
      >
        Install
      </Button>
    );
  });

  // based on this info, should be "safe" to recreate functions with each render
  //  https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render
  const appActionRenderer = (app: any) => {
    if (!app.id) return;
    //  treaties consist of <ship>/<desk> keys. parse to get app id value (desk)
    // const appId = app.id.split('/')[1];
    return <InstallButton app={app} />;
  };

  useEffect(() => {
    setSearchMode('none');
    setSearchModeArgs([]);
    setSearchString('');
    setSearchPlaceholder('Search...');
    setSelectedShip('');
  }, [spacePath]);

  useEffect(() => {
    if (searchMode === 'dev-app-search' && selectedShip) {
      if (!bazaar.hasAlly(selectedShip)) {
        if (loadingState !== 'loading-published-apps') {
          setLoadingState('loading-published-apps');
          SpacesActions.addAlly(selectedShip)
            .then((result) => {
              console.log('addAlly response => %o', result);
              const treaties = bazaar.getTreaties(selectedShip);
              setData(treaties);
            })
            .catch((e) => console.error(e))
            .finally(() => setLoadingState(''));
        }
      } else {
        const treaties = bazaar.getTreaties(selectedShip);
        console.log('treaties => %o', treaties);
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

  const secondaryTextColor = useMemo(
    () => rgba(theme.currentTheme.textColor, 0.5),
    [theme.currentTheme.textColor]
  );

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
    console.log('rendering apps => %o', apps);
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
      <>
        <Flex flexDirection="column" gap={10}>
          <Text
            fontWeight={500}
            color={theme.currentTheme.textColor}
          >{`Software developed by ${ship}...`}</Text>
          <Flex flexDirection="column" gap={12}>
            {renderDevApps(ship, loadingState, data)}
          </Flex>
        </Flex>
      </>
    );
  };

  useEffect(() => {
    console.log('app install status change');
  }, [
    bazaar.appInstallInitial,
    bazaar.appInstallStarted,
    bazaar.appInstallFailed,
    bazaar.appInstallCompleted,
  ]);

  const installApp = (app: any) => {
    const tokens = app.id.split('/');
    SpacesActions.installDesk(tokens[0], tokens[1]);
  };

  const renderAppSummary = (app: any) => {
    return (
      <>
        <Flex flexDirection="column" gap={10}>
          <Text fontWeight={'bold'}>{app.title}</Text>
          <Button onClick={(e) => installApp(app)}>Install</Button>
        </Flex>
      </>
    );
  };

  const onProviderClick = (ship: string) => {
    if (isValidPatp(ship)) {
      setSearchMode('dev-app-search');
      setSearchPlaceholder('Search...');
      setSelectedShip(ship);
      setSearchModeArgs([ship]);
      setSearchString('');
    }
  };

  return (
    <Popover
      open={searchMode !== 'none'}
      onOpenChange={(open) => {
        if (!open) {
          setSearchMode('none');
          setSelectedShip('');
          setSearchPlaceholder('Search...');
        }
      }}
      modal={false}
    >
      <PopoverAnchor asChild={false}>
        <Input
          flex={8}
          className="realm-cursor-text-cursor"
          type="text"
          placeholder={searchPlaceholder}
          bgOpacity={0.3}
          borderColor={'input.borderHover'}
          bg="bg.blendedBg"
          wrapperStyle={{
            borderRadius: 25,
            height: 42,
            width: 500,
            paddingLeft: 12,
            paddingRight: 16,
          }}
          leftLabel={
            searchMode === 'dev-app-search' && selectedShip !== ''
              ? `Apps by ${selectedShip}:`
              : 'none'
          }
          // rightIcon={
          //   <Flex>
          //     <Icons name="Search" size="18px" opacity={0.5} />
          //   </Flex>
          // }
          value={searchString}
          onKeyDown={(evt: any) => {
            if (evt.key === 'Enter' && isValidPatp(searchString)) {
              setSearchMode('dev-app-search');
              setSearchPlaceholder('Search...');
              setSelectedShip(searchString);
              setSearchModeArgs([searchString]);
              setSearchString('');
            } else if (evt.key === 'Escape') {
              setSearchPlaceholder('Search...');
              setSelectedShip('');
              setSearchString('');
            } else if (
              evt.key === 'Backspace' &&
              searchMode === 'dev-app-search' &&
              searchString.length === 0
            ) {
              setSearchMode('start');
              setSearchPlaceholder('Search...');
              setSelectedShip('');
              setSearchString('');
            }
          }}
          onChange={(e: any) => {
            setSearchString(e.target.value);
            if (e.target.value) {
              if (e.target.value[0] === '~') {
                setSearchMode('ship-search');
                setData([]);
              } else {
                if (['app-search', 'dev-app-search'].includes(searchMode)) {
                  setSearchMode(searchMode);
                } else {
                  setSearchMode('app-search');
                }
              }
            } else {
              setSearchMode('start');
            }
          }}
          // onClick={() => triggerSearch(!toggle)}
          onFocus={() => {
            if (selectedShip) {
              setSearchMode('dev-app-search');
              setSearchModeArgs([selectedShip]);
            } else if (searchString) {
              if (searchString.startsWith('~')) {
                setSearchMode('ship-search');
              } else {
                setSearchMode('app-search');
              }
            } else {
              setSearchMode('start');
            }
          }}
          onBlur={() => {
            // setSearchMode('none');
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        sideOffset={5}
        style={{
          outline: 'none',
          boxShadow: '0px 0px 9px rgba(0, 0, 0, 0.12)',
          // width: '50em',
          borderRadius: 12,
          maxHeight: '50vh',
          overflowY: 'auto',
          background:
            theme.currentTheme.mode === 'light'
              ? theme.currentTheme.windowColor
              : darken(0.1, theme.currentTheme.windowColor),
        }}
      >
        {searchMode === 'start' &&
          renderStart(spacePath, bazaar, theme.currentTheme)}
        {searchMode === 'ship-search' &&
          renderShipSearch(
            data,
            searchString,
            theme.currentTheme,
            onProviderClick
          )}
        {searchMode === 'dev-app-search' &&
          renderDevAppSearch(searchModeArgs[0], loadingState, data)}
        {searchMode === 'app-search' &&
          renderAppSearch(data, theme.currentTheme)}
        {searchMode === 'app-summary' && renderAppSummary(data)}
      </PopoverContent>
    </Popover>
  );
});

export default AppSearchApp;
