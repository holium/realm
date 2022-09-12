import { useEffect, useState } from 'react';
import { styled as stitch, keyframes } from '@stitches/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { isValidPatp } from 'urbit-ob';
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

function renderDevs(space: string, devs: any) {
  if (devs.length === 0) {
    return <Text color="#ababab">{`No recent devs`}</Text>;
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
}

function renderApps(space: string, apps: any) {
  if (apps.length === 0) {
    return <Text color="#ababab">{`No apps found`}</Text>;
  }
  return apps?.map((app, index) => (
    <div key={index}>
      <AppRow
        caption={app.title}
        app={app}
        // actionRenderer={() => actionRenderer(space, app)}
        // onClick={(e, action, app) => onAppsAction(space, action, app)}
      />
    </div>
  ));
}

const renderStart = (space: string, bazaar: any) => {
  return (
    <>
      <Flex flexDirection="column" gap={12}>
        <Text color="text.secondary" fontWeight={500}>
          Recent Apps
        </Text>
        <Flex flexDirection="column" gap={12}>
          {renderApps(space, bazaar.recentAppList)}
        </Flex>
      </Flex>
      <div style={{ marginTop: '12px', marginBottom: '12px' }}>
        <hr style={{ backgroundColor: '#dadada', height: '1px', border: 0 }} />
      </div>
      <Flex flexDirection="column" gap={12}>
        <Text color={'#8f8f8f'} fontWeight={500}>
          Recent Developers
        </Text>
        <Flex flexDirection="column" gap={12}>
          {renderDevs(space, bazaar.recentDevs)}
        </Flex>
      </Flex>
    </>
  );
};

const renderProviders = (data: Array<any>, searchString: string) => {
  return (
    data &&
    data
      .filter((item) => item.name.startsWith(searchString))
      .map((item, index) => (
        <Flex key={index} flexDirection="row" alignItems="center" gap={8}>
          <Sigil
            simple
            size={28}
            avatar={item.avatar}
            patp={item.name}
            color={[item.sigilColor || '#000000', 'white']}
          />
          <Text>{item.name}</Text>
        </Flex>
      ))
  );
};

function renderShipSearch(data: Array<any>, searchString: string) {
  return (
    <>
      <Flex flexDirection="column" gap={12}>
        <Text color={'#8f8f8f'} fontWeight={500}>
          Searching Software Providers
        </Text>
        <Flex flexDirection="column" gap={12}>
          {renderProviders(data, searchString)}
        </Flex>
      </Flex>
    </>
  );
}

const renderAppSearch = (apps: any) => {
  console.log('apps => %o', apps);
  return (
    <>
      <Flex flexDirection="column" gap={10}>
        <Text fontWeight={'bold'}>{`Installed Apps`}</Text>
        {renderApps('', apps)}
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

interface AppSearchProps {
  theme: {
    textColor: string;
    windowColor: string;
  };
}

const AppSearchApp = (props: AppSearchProps) => {
  const { spaces, bazaar } = useServices();
  const [data, setData] = useState<any>([]);
  const [searchMode, setSearchMode] = useState('none');
  const [searchModeArgs, setSearchModeArgs] = useState<Array<string>>([]);
  const [searchString, setSearchString] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('Search...');
  const [selectedShip, setSelectedShip] = useState('');

  const spacePath: string = spaces.selected?.path!;

  const currentBazaar = spaces.selected ? bazaar.getBazaar(spacePath) : null;

  useEffect(() => {
    console.log('AppSearch effect [spacePath]...');
    setSearchMode('none');
    setSearchModeArgs([]);
    setSearchString('');
    setSearchPlaceholder('Search...');
    setSelectedShip('');
  }, [spacePath]);

  useEffect(() => {
    console.log('fetching treaties => %o', selectedShip);
    if (selectedShip) {
      SpacesActions.getTreaties(selectedShip).then((items: any) => {
        console.log('treaties => %o', items);
        const data = Object.entries(items).map(([key, value], index) => ({
          ...value,
          id: value.desk,
        }));
        setData(data);
      });
    }
  }, [selectedShip, bazaar.treatyAdded]);

  useEffect(() => {
    console.log('AppSearch effect [searchString]...');
    if (searchMode === 'app-search') {
      const apps = currentBazaar?.findApps(searchString);
      console.log(apps);
      setData(apps);
    } else if (searchMode === 'dev-app-search') {
      const apps = currentBazaar?.treatyList;
      console.log(apps);
      setData(apps);
    }
  }, [searchString]);

  useEffect(() => {
    console.log('AppSearch effect [searchMode]...');
    if (searchMode === 'ship-search') {
      setData([]);
      // todo: move into bazaar "main" (no space specific) store
      //   see bazaar.allies
      SpacesActions.getAllies(spacePath).then((allies: any) => {
        let data = Object.entries(allies).map(([key, value], index) => ({
          id: key,
          name: key,
        }));
        setData(data);
      });
    } else if (searchMode === 'dev-app-search') {
      setData([]);
      // if the 'selected' ship is not yet an ally, make them one which will
      //  trigger a treay which can then be listed for installation
      if (!bazaar.hasAlly(selectedShip)) {
        console.log('adding ally => %o', selectedShip);
        SpacesActions.addAlly(selectedShip).then((result) => {
          console.log('addTreaty response => %o', result);
          setData([]);
        });
      } else {
        console.log('fetching treaties => %o', selectedShip);
        SpacesActions.getTreaties(selectedShip).then((items: any) => {
          console.log('treaties => %o', items);
          const data = Object.entries(items).map(([key, value], index) => ({
            ...value,
            id: value.desk,
          }));
          setData(data);
        });
      }
    } else if (searchMode === 'dev-app-detail') {
      setData([]);
      // if the 'selected' ship is not yet an ally, make them one which will
      //  trigger a treay which can then be listed for installation
      const treatyDetail = currentBazaar?.getTreatyDetail(
        searchModeArgs[0],
        searchModeArgs[1]
      );
      if (treatyDetail) {
        setData(treatyDetail);
      }
    }
  }, [searchMode]);

  // const onDevAppAction = (app: any) => {
  //   console.log('onDevAppAction => %o', app);
  // };

  // const devAppRowRenderer = (app: any) => (
  //   <>
  //     <Button borderRadius={6} onClick={(e) => onDevAppAction(app)}>
  //       Install
  //     </Button>
  //   </>
  // );

  const renderDevApps = (apps: Array<any>) => {
    if (apps.length === 0) {
      return <Text color="#ababab">{`No apps found`}</Text>;
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
            color={'#8f8f8f'}
          >{`Software developed by ${ship}...`}</Text>
          <Flex flexDirection="column" gap={12}>
            {renderDevApps(data)}
          </Flex>
        </Flex>
      </>
    );
  };

  const installApp = (app: any) => {
    console.log('installApp => %o', app);
    SpacesActions.installApp(app);
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
      <PopoverContent sideOffset={5}>
        {searchMode === 'start' && renderStart(spacePath, currentBazaar)}
        {searchMode === 'ship-search' && renderShipSearch(data, searchString)}
        {searchMode === 'dev-app-search' &&
          renderDevAppSearch(searchModeArgs[0], data)}
        {searchMode === 'app-search' && renderAppSearch(data)}
        {searchMode === 'app-summary' && renderAppSummary(data)}
      </PopoverContent>
    </Popover>
  );
};

export default AppSearchApp;
