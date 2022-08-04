import { useEffect, useState } from 'react';
import { styled, keyframes } from '@stitches/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { isValidPatp } from 'urbit-ob';
import { Input } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { BazaarActions } from 'renderer/logic/actions/bazaar';
import { InviteMembers } from 'renderer/apps/Spaces/Workflow/InviteMembers';

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
const StyledContent = styled(PopoverPrimitive.Content, {
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

const StyledArrow = styled(PopoverPrimitive.Arrow, {
  fill: 'white',
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

function renderApps() {
  const apps = [{ id: 0, name: 'TODO: Determine how to store recent apps...' }];
  return apps.map((item, index) => <Text key={item.id}>{item.name}</Text>);
}
function renderStart() {
  return (
    <>
      <Flex css={{ flexDirection: 'column' }}>
        <Text bold>Recent Apps</Text>
        {renderApps()}
        <Text bold>Recent Developers</Text>
      </Flex>
    </>
  );
}

function renderShipSearch() {
  return (
    <>
      <Flex css={{ flexDirection: 'column', gap: 10 }}>
        <Text bold css={{ marginBottom: 10 }}>
          Searching software providers...
        </Text>
      </Flex>
    </>
  );
}

const renderAppSearch = (ship: string) => {
  return (
    <>
      <Flex css={{ flexDirection: 'column', gap: 10 }}>
        <Text bold css={{ marginBottom: 10 }}>
          {`Software developed by ${ship}...`}
        </Text>
      </Flex>
    </>
  );
};

const StyledClose = styled(PopoverPrimitive.Close, {
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

// Your app...
const Flex = styled('div', { display: 'flex' });

const IconButton = styled('button', {
  all: 'unset',
  fontFamily: 'inherit',
  borderRadius: '100%',
  height: 35,
  width: 35,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#00FF00',
  backgroundColor: 'white',
  boxShadow: `0 2px 10px #000000`,
  '&:hover': { backgroundColor: '#00FF00' },
  '&:focus': { boxShadow: `0 0 0 2px black` },
});
const Fieldset = styled('fieldset', {
  all: 'unset',
  display: 'flex',
  gap: 20,
  alignItems: 'center',
});

const Label = styled('label', {
  fontSize: 13,
  color: '#00FF00',
  width: 75,
});

// const Input = styled('input', {
//   all: 'unset',
//   width: '100%',
//   display: 'inline-flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   flex: '1',
//   borderRadius: 4,
//   padding: '0 10px',
//   fontSize: 13,
//   lineHeight: 1,
//   color: '#00FF00',
//   boxShadow: `0 0 0 1px #00FF00`,
//   height: 25,

//   '&:focus': { boxShadow: `0 0 0 2px #00FF00` },
// });

const Text = styled('div', {
  margin: 0,
  color: '#ababab',
  fontSize: 15,
  lineHeight: '19px',
  variants: {
    faded: {
      true: { color: '#ababab' },
    },
    bold: {
      true: { fontWeight: 500 },
    },
  },
});

const AppSearchApp = (props) => {
  const { space } = props;
  const { spaces } = useServices();
  const [toggle, triggerSearch] = useState(false);
  const [data, setData] = useState([]);
  const [searchMode, setSearchMode] = useState('none');
  const [searchModeArgs, setSearchModeArgs] = useState<Array<string>>([]);
  const [searchString, setSearchString] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('Search');
  const [selectedShip, setSelectedShip] = useState('');
  useEffect(() => {
    console.log('AppSearch: useEffect called');
    // if (space === 'ours') {
    BazaarActions.getAllies().then((allies: any) => {
      let data = Object.entries(allies).map(([key, value], index) => ({
        id: key,
        name: key,
      }));
      console.log(data);
      setData(data);
    });
    // } else {
    //   BazaarActions.getApps(
    //     spaces.selected.name,
    //     spaces.selected.path,
    //     'recommended'
    //   ).then((apps: any) => {
    //     setData(apps);
    //   });
    // }
  }, []);

  return (
    <Popover
      open={searchMode !== 'none'}
      onOpenChange={(open) => {
        console.log(open);
        if (!open) {
          setSearchMode('none');
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
          // rightIcon={
          //   <Flex>
          //     <Icons name="Search" size="18px" opacity={0.5} />
          //   </Flex>
          // }
          value={searchString}
          onKeyDown={(evt: any) => {
            if (evt.key === 'Enter' && isValidPatp(searchString)) {
              setSearchPlaceholder(
                [searchString, ': Search for apps...'].join(' ')
              );
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
            if (isValidPatp(e.target.value)) {
            }
          }}
          // onClick={() => triggerSearch(!toggle)}
          onFocus={() => {
            if (selectedShip) {
              setSearchMode('app-search');
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
        {searchMode === 'start' && renderStart()}
        {searchMode === 'ship-search' && renderShipSearch()}
        {searchMode === 'app-search' && renderAppSearch(searchModeArgs[0])}
      </PopoverContent>
    </Popover>
  );
};

export default AppSearchApp;
