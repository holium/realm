import { useEffect, useState } from 'react';
import { styled as stitch, keyframes } from '@stitches/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { isValidPatp } from 'urbit-ob';
import { Input, Flex, Box, Text, Icons, Sigil } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { toJS } from 'mobx';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { AppRow } from './AppRow';

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

const onAppsAction = (space: string, action: string, app: any) => {
  console.log('onAppsAction => %o', { action, app });
  SpacesActions.addAppTag(space, app.id, 'suite').then((data) => {
    console.log('addAppTag response => %o', data);
  });
};

function renderDevs(space: string, devs: any) {
  if (devs.length === 0) {
    return <Text color="#ababab">{`No recent devs`}</Text>;
  }
  return devs?.map((item, index) => (
    <div key={index}>
      <AppRow
        caption={item.title}
        app={item}
        onClick={(e, action, app) => onAppsAction(space, action, app)}
      />
    </div>
  ));
}

function renderApps(space: string, apps: any) {
  if (apps.length === 0) {
    return <Text color="#ababab">{`No recent apps`}</Text>;
  }
  return apps?.map((app, index) => (
    <div key={index}>
      <AppRow
        caption={app.title}
        app={app}
        onClick={(e, action, app) => onAppsAction(space, action, app)}
      />
    </div>
  ));
}

const renderStart = (space: string, bazaar: any) => {
  return (
    <>
      <Flex flexDirection="column" gap={12}>
        <Text color={'#8f8f8f'} fontWeight={500}>
          Recent Apps
        </Text>
        <Flex flexDirection="column" gap={12}>
          {renderApps(space, bazaar.recentApps)}
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
  return data
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
    ));
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

const renderDevApps = (apps: Array<any>) => {
  if (apps.length === 0) {
    return <Text color="#ababab">{`No apps found`}</Text>;
  }
  return apps?.map((app, index) => (
    <div key={index}>
      <Flex flexDirection="row" alignItems="center" gap={8}>
        <TileStyle
          onContextMenu={(evt: any) => {
            evt.stopPropagation();
          }}
          minWidth={sizes.sm}
          style={{
            borderRadius: radius.sm,
            overflow: 'hidden',
          }}
          height={sizes.sm}
          width={sizes.sm}
          backgroundColor={app.color || '#F2F3EF'}
        >
          {app.image && (
            <img
              style={{ pointerEvents: 'none' }}
              draggable="false"
              height={sizes.sm}
              width={sizes.sm}
              key={app.title}
              src={app.image}
            />
          )}
          {app.icon && <Icons name={app.icon} height={16} width={16} />}
        </TileStyle>
        <Flex flexDirection="column">
          <Text fontWeight={500}>{app.title}</Text>
          <Text color={'#888888'}>{app.info}</Text>
        </Flex>
      </Flex>
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

const renderAppSearch = () => {
  return (
    <>
      <Flex flexDirection="column" gap={10}>
        <Text fontWeight={'bold'}>{`Installed Apps`}</Text>
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

const AppSearchApp = (props) => {
  const { spaces, bazaar } = useServices();
  const [data, setData] = useState([]);
  const [searchMode, setSearchMode] = useState('none');
  const [searchModeArgs, setSearchModeArgs] = useState<Array<string>>([]);
  const [searchString, setSearchString] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('Search...');
  const [selectedShip, setSelectedShip] = useState('');
  const isOur = spaces.selected?.type === 'our';
  const currentBazaar = spaces.selected
    ? bazaar.getBazaar(spaces.selected?.path)
    : null;
  useEffect(() => {
    console.log('AppSearch: useEffect called => %o', spaces.selected?.path);
    if (searchMode === 'ship-search') {
      SpacesActions.getAllies(spaces.selected?.path).then((allies: any) => {
        let data = Object.entries(allies).map(([key, value], index) => ({
          id: key,
          name: key,
        }));
        setData(data);
      });
    } else if (searchMode === 'dev-app-search') {
      SpacesActions.getTreaties(searchModeArgs[0]).then((items: any) => {
        let data = Object.entries(items).map(([key, value], index) => ({
          id: key,
          name: key,
        }));
        setData(data);
      });
    } else if (searchMode === 'app-search') {
      SpacesActions.getApps(spaces.selected?.path).then((items: any) => {
        let data = Object.entries(items).map(([key, value], index) => ({
          id: key,
          name: key,
        }));
        setData(data);
      });
    }
  }, [searchMode, spaces.selected?.path]);

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
              } else {
                setSearchMode('app-search');
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
              setSearchMode('ship-search');
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
        {searchMode === 'start' &&
          renderStart(spaces.selected?.path, currentBazaar)}
        {searchMode === 'ship-search' && renderShipSearch(data, searchString)}
        {searchMode === 'dev-app-search' &&
          renderDevAppSearch(searchModeArgs[0], data)}
        {searchMode === 'app-search' && renderAppSearch()}
      </PopoverContent>
    </Popover>
  );
};

export default AppSearchApp;
