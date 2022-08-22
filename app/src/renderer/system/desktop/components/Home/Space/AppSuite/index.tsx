import { FC, useEffect, useState } from 'react';
import { Flex, Text, Box } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { SuiteApp } from './App';
import { SpacesActions } from 'renderer/logic/actions/spaces';

import { styled, keyframes } from '@stitches/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { AppRow } from '../../AppRow';

type AppSuiteProps = {
  patp: string;
  space: SpaceModelType;
  suite: any[];
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

const onAppsAction = (path: string, appId: string, tag: any) => {
  console.log('onAppsAction => %o', { path, appId, tag });
  SpacesActions.addAppTag(path, appId, tag).then((result) =>
    console.log('onAppsAction => %o', result)
  );
};

// Exports
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverContent = Content;

export const AppSuite: FC<AppSuiteProps> = (props: AppSuiteProps) => {
  const { patp, space, suite } = props;
  const [searchMode, setSearchMode] = useState('none');
  const [apps, setApps] = useState<any[]>([]);

  const emptyArr = [...Array(5 - suite.length).keys()];

  console.log(suite, emptyArr);

  useEffect(() => {
    SpacesActions.getApps(`/${patp}/our`).then((items: any) => {
      console.log(items);
      let apps: any[] = Object.entries(items).map(([key, value], index) => ({
        desk: key,
        detail: value,
      }));
      setApps(apps || []);
    });
  }, [space.path]);

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
        {suite.map((app: number, index: number) => (
          <SuiteApp key={index} space={space} app={app} />
        ))}
        {emptyArr.map((el: number, index: number) => (
          <SuiteApp
            key={index + suite.length}
            space={space}
            app={undefined}
            onClick={(e) => setSearchMode('app-search')}
          />
        ))}
      </Flex>
      <Popover
        open={searchMode !== 'none'}
        onOpenChange={(open) => {
          if (!open) {
            setSearchMode('none');
          }
        }}
      >
        <PopoverAnchor asChild>
          <div style={{ width: '100%', height: '1px' }}></div>
        </PopoverAnchor>
        <PopoverContent sideOffset={-60} style={{ width: '50em' }}>
          <Flex flexDirection={'column'} gap={10}>
            <Text variant="h5" fontWeight={500}>
              Installed Apps
            </Text>
            {apps.length === 0 && <Text color={'#ababab'}>No apps found</Text>}
            {apps.map((item, index) => (
              <div key={index}>
                <AppRow
                  caption={item.desk}
                  app={item.detail?.docket}
                  onClick={(e, action, app) =>
                    onAppsAction(space.path, app.href?.glob?.base, 'suite')
                  }
                />
              </div>
            ))}
          </Flex>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};

AppSuite.defaultProps = {
  suite: [],
};
