import { FC, useEffect, useMemo, useState } from 'react';
import { Flex, Text, Button } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { SuiteApp } from './App';
import { SpacesActions } from 'renderer/logic/actions/spaces';

import { styled, keyframes } from '@stitches/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { AppRow } from '../../AppInstall/AppRow';
import { useServices } from 'renderer/logic/store';

import { cleanNounColor } from 'os/lib/color';
import { observer } from 'mobx-react';
import { darken, rgba } from 'polished';
import { BazaarStoreType } from 'os/services/spaces/models/bazaar-old';
import { RealmPopover } from '../../Popover';
import { calculatePopoverAnchorById } from 'renderer/logic/lib/position';
import { AppModelType } from 'os/services/ship/models/docket';
import { AppType } from 'os/services/spaces/models/bazaar';

type AppSuiteProps = {
  patp: string;
  isAdmin: boolean;
  // suite?: AppModelType[];
};
// const emptyArr = [1, 2, 3, 4, 5];

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

function Content({ children, ...props }: any) {
  return (
    <PopoverPrimitive.Portal>
      <StyledContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => {
          // @ts-ignore
          if (document.activeElement) document.activeElement.blur();
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

// Exports
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverContent = Content;

export const AppSuite: FC<AppSuiteProps> = observer((props: AppSuiteProps) => {
  const { patp, isAdmin } = props;
  const { theme, bazaar, spaces } = useServices();
  const space = spaces.selected!;
  const suite = bazaar.getSuite(space.path);
  const apps = [...bazaar.installed, ...bazaar.installing];

  const [searchMode, setSearchMode] = useState('none');
  const [suiteIndex, setSuiteIndex] = useState(-1);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const { accentColor, windowColor, textColor, iconColor } = theme.currentTheme;

  const isOpen = searchMode !== 'none';
  const backgroundColor = useMemo(
    () =>
      theme.currentTheme.mode === 'light'
        ? theme.currentTheme.windowColor
        : darken(0.1, theme.currentTheme.windowColor),
    [theme.currentTheme]
  );

  const dimensions = {
    height: 450,
    width: 550,
  };

  const popoverId = `app-suite-${suiteIndex}`;
  const popover = useMemo(
    () => (
      <RealmPopover
        id={popoverId}
        isOpen={isOpen}
        coords={coords}
        dimensions={dimensions}
        onClose={() => {
          setSearchMode('none');
          setSuiteIndex(-1);
        }}
        style={{
          outline: 'none',
          boxShadow: '0px 0px 9px rgba(0, 0, 0, 0.12)',
          borderRadius: 12,
          maxHeight: '50vh',
          overflowY: 'auto',
          background: backgroundColor,
        }}
      >
        <Flex flexDirection={'column'}>
          <Text variant="h6" fontWeight={500} color={textColor}>
            Installed Apps
          </Text>
          <div style={{ marginTop: '2px', marginBottom: '2px' }}>
            <hr
              style={{
                backgroundColor: rgba(iconColor, 0.3),
                height: '1px',
                border: 0,
              }}
            />
          </div>
          {(apps.length === 0 && (
            <Text color={rgba(textColor, 0.4)}>No apps found</Text>
          )) || (
            <Flex flexDirection={'column'} gap={10}>
              {apps.map((item, index) => (
                <div key={index}>
                  <AppRow
                    caption={item.id}
                    app={item}
                    actionRenderer={() => (
                      <Button
                        borderRadius={6}
                        onClick={(e) => {
                          setSearchMode('none');
                          setSuiteIndex(-1);
                          SpacesActions.addToSuite(
                            space.path,
                            item.id,
                            suiteIndex
                          );
                        }}
                      >
                        Add to Suite
                      </Button>
                    )}
                    onClick={() => {}}
                  />
                </div>
              ))}
            </Flex>
          )}
        </Flex>
      </RealmPopover>
    ),
    [popoverId, setSearchMode, isOpen, coords, theme.currentTheme]
  );

  const appTile = (app: any | null, index: number) => (
    <>
      {(app && (
        <SuiteApp
          key={index}
          index={index}
          id={`app-suite-${index}-trigger`}
          isAdmin={isAdmin}
          space={space}
          selected={index === suiteIndex}
          accentColor={accentColor}
          app={app}
        />
      )) || (
        <SuiteApp
          key={index}
          index={index}
          id={`app-suite-${index}-trigger`}
          space={space}
          selected={index === suiteIndex}
          accentColor={accentColor}
          app={undefined}
          onClick={(e) => {
            if (isAdmin) {
              setCoords(
                calculatePopoverAnchorById(`app-suite-${index}-trigger`, {
                  dimensions,
                  anchorOffset: {
                    y: 12,
                  },
                  centered: true,
                })
              );
              setSearchMode('app-search');
              setSuiteIndex(index);
            }
          }}
        />
      )}
    </>
  );

  return (
    <Flex flexDirection="column" position="relative" gap={20} mb={60}>
      <Flex>
        <Text variant="h3" fontWeight={500}>
          App Suite
        </Text>
      </Flex>
      <Flex
        flexGrow={1}
        flex={5}
        height={210}
        position="relative"
        justifyContent="space-between"
      >
        {suite && appTile(suite.get('0'), 0)}
        {suite && appTile(suite.get('1'), 1)}
        {suite && appTile(suite.get('2'), 2)}
        {suite && appTile(suite.get('3'), 3)}
        {suite && appTile(suite.get('4'), 4)}
      </Flex>
      {popover}
    </Flex>
  );
});

AppSuite.defaultProps = {
  // suite: [null, null, null, null],
};
