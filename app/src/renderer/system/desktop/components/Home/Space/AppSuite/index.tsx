import { FC, useEffect, useState } from 'react';
import { Flex, Text, Button } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { SuiteApp } from './App';
import { SpacesActions } from 'renderer/logic/actions/spaces';

import { styled, keyframes } from '@stitches/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { AppRow } from '../../AppRow';
import { useServices } from 'renderer/logic/store';

import { cleanNounColor } from 'os/lib/color';

type AppSuiteProps = {
  patp: string;
  space: SpaceModelType;
  apps: any[];
  suite: any[];
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

// Exports
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverContent = Content;

export const AppSuite: FC<AppSuiteProps> = (props: AppSuiteProps) => {
  const { patp, space, apps, suite, isAdmin } = props;
  // const { spaces } = useServices();
  const [searchMode, setSearchMode] = useState('none');
  const [suiteIndex, setSuiteIndex] = useState(-1);

  const onAppsAction = (path: string, app: any, tag: any, rank: number) => {
    console.log('onAppsAction => %o', { path, id: app.id, tag });
    SpacesActions.addToSuite(path, app.id, rank);
  };

  const actionRenderer = (space: string, app: any, rank: number) => (
    <>
      <Button
        borderRadius={6}
        onClick={(e) => onAppsAction(space, app, 'suite', rank)}
      >
        Add to Suite
      </Button>
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
        {suite.map(
          (app: any, index: number) =>
            (app && (
              <SuiteApp
                key={index}
                isAdmin={isAdmin}
                space={space}
                app={app}
                onClick={() => {
                  SpacesActions.removeFromSuite(space.path, app.id);
                }}
              />
            )) || (
              <SuiteApp
                key={index}
                space={space}
                app={undefined}
                onClick={(e) => {
                  setSearchMode('app-search');
                  setSuiteIndex(index);
                }}
              />
            )
        )}
        {/* {emptyArr.map((el: number, index: number) => (
          <SuiteApp
            key={index + suite.length}
            space={space}
            app={undefined}
            onClick={(e) => {
              setSearchMode('app-search');
              setSuiteIndex(index);
            }}
          />
        ))} */}
      </Flex>
      <Popover
        open={searchMode !== 'none'}
        onOpenChange={(open) => {
          if (!open) {
            setSearchMode('none');
          }
        }}
        modal={false}
      >
        <PopoverAnchor asChild>
          <div style={{ width: '100%', height: '1px' }}></div>
        </PopoverAnchor>
        <PopoverContent sideOffset={-60} style={{ width: '50em' }}>
          <Flex flexDirection={'column'}>
            <Text variant="h6" fontWeight={500} color={'#ababab'}>
              Installed Apps
            </Text>
            <div style={{ marginTop: '2px', marginBottom: '2px' }}>
              <hr
                style={{ backgroundColor: '#dadada', height: '1px', border: 0 }}
              />
            </div>
            {(apps.length === 0 && (
              <Text color={'#ababab'}>No apps found</Text>
            )) || (
              <Flex flexDirection={'column'} gap={10}>
                {apps.map((item, index) => (
                  <div key={index}>
                    <AppRow
                      caption={item.id}
                      app={item}
                      actionRenderer={() =>
                        actionRenderer(space.path, item, suiteIndex)
                      }
                    />
                  </div>
                ))}
              </Flex>
            )}
          </Flex>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};

AppSuite.defaultProps = {
  suite: [],
};
