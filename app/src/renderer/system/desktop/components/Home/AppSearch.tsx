import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { styled as stitch, keyframes } from '@stitches/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { isValidPatp } from 'urbit-ob';
import { Input, Flex, Box, Text, Icons } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { toJS } from 'mobx';
import MenuItemStyle from 'renderer/components/MenuItem/MenuItem.styles';

const sizes = {
  sm: 32,
  md: 48,
  lg: 120,
  xl: 148,
  xxl: 210,
};

const radius = {
  sm: 4,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 20,
};

const scales = {
  sm: 0.07,
  md: 0.05,
  lg: 0.07,
  xl: 0.05,
  xxl: 0.02,
};

interface TileStyleProps {}
const TileStyle = styled(Box)<TileStyleProps>`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  user-select: none;
  img {
    --webkit-user-select: none;
    --khtml-user-select: none;
    --moz-user-select: none;
    --o-user-select: none;
    user-select: none;
  }
`;

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

function renderDevs(devs: any) {
  if (devs.length === 0) {
    return <Text color="#ababab">{`No recent devs`}</Text>;
  }
  return devs?.map((item, index) => (
    <div key={index}>
      <Flex flexDirection="row" alignItems="center" gap={8}>
        <TileStyle
          id={index}
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
          backgroundColor={item.color || '#F2F3EF'}
        >
          {item.image && (
            <img
              style={{ pointerEvents: 'none' }}
              draggable="false"
              height={sizes.sm}
              width={sizes.sm}
              key={item.title}
              src={item.image}
            />
          )}
          {item.icon && <Icons name={item.icon} height={12} width={12} />}
        </TileStyle>
        <Text>{item.id}</Text>
      </Flex>
    </div>
  ));
}

function renderApps(apps: any) {
  if (apps.length === 0) {
    return <Text color="#ababab">{`No recent apps`}</Text>;
  }
  apps?.map((item) => console.log(toJS(item)));
  return apps?.map((app, index) => (
    <div key={index}>
      <Flex flexDirection="row" alignItems="center" gap={8}>
        <TileStyle
          id={index}
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
          {app.icon && <Icons name={app.icon} height={12} width={12} />}
        </TileStyle>
        <Text>{app.id}</Text>
      </Flex>
    </div>
  ));
}

const renderStart = (bazaar: any) => {
  return (
    <>
      <Flex flexDirection="column" gap={10}>
        <Text fontWeight="bold">Recent Apps</Text>
        <Flex flexDirection="column" gap={12}>
          {renderApps(bazaar.recentApps)}
        </Flex>
        <Text fontWeight="bold">Recent Developers</Text>
        <Flex flexDirection="column" gap={4}>
          {renderDevs(bazaar.recentDevs)}
        </Flex>
      </Flex>
    </>
  );
};

const renderProviders = (data: Array, searchString) => {
  return data
    .filter((item) => item.name.startsWith(searchString))
    .map((item, index) => <Text>{item.name}</Text>);
};

function renderShipSearch(data, searchString) {
  return (
    <>
      <Flex css={{ flexDirection: 'column', gap: 10 }}>
        <Text bold css={{ marginBottom: 10 }}>
          Searching Software Providers
        </Text>
        <Flex css={{ flexDirection: 'column', gap: 2 }}>
          {renderProviders(data, searchString)}
        </Flex>
      </Flex>
    </>
  );
}

const renderDevAppSearch = (ship: string) => {
  return (
    <>
      <Flex flexDirection="column" gap={10}>
        <Text fontWeight={'bold'}>{`Software developed by ${ship}...`}</Text>
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
  const { space } = props;
  const { ship, spaces, bazaar } = useServices();
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
  console.log('current bazaar => %o', {
    path: spaces.selected?.path,
    currentBazaar,
  });
  useEffect(() => {
    console.log('AppSearch: useEffect called => %o', spaces.selected?.path);
    // if (spaces.selected?.path) {
    //   if (isOur) {
    //     BazaarActions.getAllies().then((allies: any) => {
    //       let data = Object.entries(allies).map(([key, value], index) => ({
    //         id: key,
    //         name: key,
    //       }));
    //       console.log(data);
    //       setData(data);
    //     });
    //   } else {
    //     BazaarActions.getApps(spaces.selected?.path).then((apps: any) => {
    //       let data = Object.entries(apps).map(([key, value], index) => ({
    //         id: key,
    //         name: key,
    //       }));
    //       console.log(data);
    //       setData(data);
    //     });
    //   }
    // }
  }, [spaces.selected?.path]);

  return (
    <Popover
      open={searchMode !== 'none'}
      onOpenChange={(open) => {
        console.log(open);
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
            searchMode === 'ship-search' && selectedShip !== ''
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
              setSearchPlaceholder('Search...');
              setSelectedShip(searchString);
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
              console.log('starting search...');
              setSearchMode('start');
            }
          }}
          onBlur={() => {
            // setSearchMode('none');
          }}
        />
      </PopoverAnchor>
      <PopoverContent sideOffset={5}>
        {searchMode === 'start' && renderStart(currentBazaar)}
        {searchMode === 'ship-search' && renderShipSearch(data, searchString)}
        {searchMode === 'dev-app-search' &&
          renderDevAppSearch(searchModeArgs[0])}
        {searchMode === 'app-search' && renderAppSearch()}
      </PopoverContent>
    </Popover>
  );
};

export default AppSearchApp;
