import { useMemo, useState } from 'react';
import { Flex, Text, Button } from 'renderer/components';
import { SuiteApp } from './App';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { styled, keyframes } from '@stitches/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { AppRow } from '../../AppInstall/AppRow';
import { useServices } from 'renderer/logic/store';
import { observer } from 'mobx-react';
import { darken, rgba } from 'polished';
import { RealmPopover } from '../../Popover';
import { calculatePopoverAnchorById } from 'renderer/logic/lib/position';

interface AppSuiteProps {
  patp: string;
  isAdmin: boolean;
  // suite?: AppModelType[];
}
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
          // @ts-expect-error
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

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverContent = Content;

const dimensions = {
  height: 450,
  width: 550,
};

const AppSuitePresenter = (props: AppSuiteProps) => {
  const { isAdmin } = props;
  const { theme, bazaar, spaces } = useServices();
  const space = spaces.selected!;
  const suite = bazaar.getSuite(space.path);
  const apps = bazaar.installed;

  const [searchMode, setSearchMode] = useState('none');
  const [suiteIndex, setSuiteIndex] = useState(-1);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const { accentColor, textColor } = theme.currentTheme;

  const isOpen = searchMode !== 'none';
  const backgroundColor = useMemo(
    () =>
      theme.currentTheme.mode === 'light'
        ? theme.currentTheme.windowColor
        : darken(0.1, theme.currentTheme.windowColor),
    [theme.currentTheme]
  );

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
          maxHeight: dimensions.height,
          overflowY: 'auto',
          background: backgroundColor,
        }}
      >
        <Flex flexDirection="column" gap={12}>
          <Text variant="h6" mb={1} fontWeight={500} color={textColor}>
            Installed Apps
          </Text>
          {(apps.length === 0 && (
            <Text color={rgba(textColor, 0.4)}>No apps found</Text>
          )) || (
            <Flex flexDirection={'column'} gap={10}>
              {apps.map((item, index) => (
                <AppRow
                  key={index}
                  app={item}
                  descriptionWidth={dimensions.width - 225}
                  actionRenderer={() => (
                    <Button
                      borderRadius={6}
                      onClick={() => {
                        setSearchMode('none');
                        setSuiteIndex(-1);
                        SpacesActions.addToSuite(
                          space.path,
                          item!.id,
                          suiteIndex
                        );
                      }}
                    >
                      Add to Suite
                    </Button>
                  )}
                  onClick={() => {}}
                />
              ))}
            </Flex>
          )}
        </Flex>
      </RealmPopover>
    ),
    [
      apps,
      backgroundColor,
      coords,
      isOpen,
      popoverId,
      space.path,
      suiteIndex,
      textColor,
    ]
  );

  const AppTile = ({ app, index }: { app: any | null; index: number }) => {
    if (app) {
      return (
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
      );
    }

    return (
      <SuiteApp
        key={index}
        index={index}
        id={`app-suite-${index}-trigger`}
        space={space}
        selected={index === suiteIndex}
        accentColor={accentColor}
        app={undefined}
        isAdmin={isAdmin}
        onClick={(evt: React.MouseEvent<any>) => {
          evt.stopPropagation();
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
    );
  };

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
        {suite && <AppTile app={suite.get('0')} index={0} />}
        {suite && <AppTile app={suite.get('1')} index={1} />}
        {suite && <AppTile app={suite.get('2')} index={2} />}
        {suite && <AppTile app={suite.get('3')} index={3} />}
        {suite && <AppTile app={suite.get('4')} index={4} />}
      </Flex>
      {popover}
    </Flex>
  );
};

export const AppSuite = observer(AppSuitePresenter);
