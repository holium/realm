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
} from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { toJS } from 'mobx';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { AppRow } from './AppRow';
import { setEnvironmentData } from 'worker_threads';
import { BazaarApi } from 'os/api/bazaar';
import { darken, rgba } from 'polished';

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

// const onAppsAction = (space: string, action: string, app: any) => {
//   console.log('onAppsAction => %o', { action, app });
//   SpacesActions.addAppTag(space, app.id, action).then((data) => {
//     console.log('addAppTag response => %o', data);
//   });
// };

// const actionRenderer = (space: string, app: any) => (
//   <>
//     <Button
//       borderRadius={6}
//       onClick={(e) => onAppsAction(space, 'pinned', app)}
//     >
//       Pin
//     </Button>

//     <Button
//       style={{ marginLeft: 5 }}
//       borderRadius={6}
//       onClick={(e) => onAppsAction(space, 'recommend', app)}
//     >
//       Like
//     </Button>
//   </>
// );

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
    (app: any) => app.type !== 'urbit' || app.installed
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

const renderProviders = (data: Array<any>, searchString: string) => {
  return (
    data &&
    data
      .filter((item) => item.ship.startsWith(searchString))
      .map((item, index) => (
        <Flex key={index} flexDirection="row" alignItems="center" gap={8}>
          <Sigil
            simple
            size={28}
            // avatar={item.avatar}
            patp={item.ship}
            color={[item.sigilColor || '#000000', 'white']}
          />
          <Text>{item.ship}</Text>
        </Flex>
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
  theme: any
) => {
  return (
    <>
      <Flex flexDirection="column" gap={12}>
        <Text color={rgba(theme.textColor, 0.7)} fontWeight={500}>
          Searching Software Providers
        </Text>
        <Flex flexDirection="column" gap={12}>
          {renderProviders(data, searchString)}
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

  const spacePath: string = spaces.selected?.path!;

  useEffect(() => {
    setSearchMode('none');
    setSearchModeArgs([]);
    setSearchString('');
    setSearchPlaceholder('Search...');
    setSelectedShip('');
  }, [spacePath]);

  useEffect(() => {
    if (selectedShip) {
      console.log(toJS(bazaar.allies));
      if (!bazaar.hasAlly(selectedShip)) {
        console.log('here bro');
        SpacesActions.addAlly(selectedShip).then((result) => {
          console.log('addTreaty response => %o', result);
          const treaties = bazaar.getTreaties(selectedShip);
          setData(treaties);
        });
      }
    }
  }, [selectedShip, bazaar.treatyAdded]);

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
    } else if (searchMode === 'dev-app-search') {
      setData([]);
      // if the 'selected' ship is not yet an ally, make them one which will
      //  trigger a treay which can then be listed for installation
      if (!bazaar.hasAlly(selectedShip)) {
        SpacesActions.addAlly(selectedShip).then((result) => {
          console.log('addTreaty response => %o', result);
          const treaties = bazaar.getTreaties(selectedShip);
          setData(treaties);
        });
      } else {
        const treaties = bazaar.getTreaties(selectedShip);
        setData(treaties);
      }
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

  const renderDevApps = (apps: Array<any>) => {
    if (!apps || apps.length === 0) {
      return <Text color={secondaryTextColor}>{`No apps found`}</Text>;
    }
    return apps?.map((app, index) => (
      <div key={index}>
        <AppRow
          caption={app.title}
          app={app}
          // actionRenderer={() => devAppRowRenderer(app)}
          onClick={(app: any) => {
            setData(app);
            setSearchMode('app-summary');
          }}
        />
      </div>
    ));
  };

  const renderDevAppSearch = (ship: string, data: Array<any>) => {
    return (
      <>
        <Flex flexDirection="column" gap={10}>
          <Text
            fontWeight={500}
            color={theme.currentTheme.textColor}
          >{`Software developed by ${ship}...`}</Text>
          <Flex flexDirection="column" gap={12}>
            {renderDevApps(data)}
          </Flex>
        </Flex>
      </>
    );
  };

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
          renderShipSearch(data, searchString, theme.currentTheme)}
        {searchMode === 'dev-app-search' &&
          renderDevAppSearch(searchModeArgs[0], data)}
        {searchMode === 'app-search' &&
          renderAppSearch(data, theme.currentTheme)}
        {searchMode === 'app-summary' && renderAppSummary(data)}
      </PopoverContent>
    </Popover>
  );
});

export default AppSearchApp;
