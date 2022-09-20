import { FC, useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import { Flex, Text } from 'renderer/components';

import { SpaceTitlebar } from './Titlebar';
import { AppSuite } from './AppSuite';
import { RecommendedApps } from './Recommended';
import { RecentActivity } from './RecentActivity';
import { Members } from '../Members';
import { AppGrid } from '../Ship/AppGrid';
import { sampleSuite } from './sample-suite';

type HomePaneProps = {
  isOpen?: boolean;
};

type SidebarType = 'members' | null;

export const SpaceHome: FC<HomePaneProps> = observer((props: HomePaneProps) => {
  const { isOpen } = props;
  const { ship, theme, spaces, membership, bazaar } = useServices();
  const currentSpace = spaces.selected;
  const [members, setMembers] = useState<any>([]);
  const [sidebar, setSidebar] = useState<SidebarType>(null);
  const [appGrid, showAppGrid] = useState(false);
  const [apps, setApps] = useState<any>([]);
  const [suite, setSuite] = useState<any>([]);
  const currentBazaar = bazaar.spaces.get(currentSpace?.path!);
  const isAdmin = membership.isAdmin(currentSpace?.path!, ship!.patp!) || false;
  console.log('isAdmin => %o', isAdmin);

  useEffect(() => {
    if (currentSpace) {
      const memberMap = membership.getMembersList(currentSpace.path);
      setMembers(memberMap);
    }
  }, [currentSpace]);

  useEffect(() => {
    console.log('AppSuite useEffect => %o', {
      ship: ship?.patp,
      path: currentSpace?.path,
    });
    if (currentSpace) {
      // @ts-ignore
      const suite = Array(5).fill(undefined);
      const apps = bazaar.getSuiteApps(currentSpace.path);
      apps?.forEach((app, index) => suite.splice(app.ranks!.suite, 1, app));
      // console.log(suite);
      setSuite(suite);
    }
  }, [currentSpace, currentBazaar?.suiteChange]);

  useEffect(() => {
    setApps(bazaar.getAvailableApps());
  }, [bazaar.appsChange]);

  const sidebarComponent = useMemo(() => {
    return (
      <AnimatePresence>
        {sidebar !== null && (
          <Flex
            position="absolute"
            right="8px"
            top="8px"
            bottom={58}
            initial={{ opacity: 0, width: 40 }}
            animate={{ opacity: 1, width: 330 }}
            exit={{ opacity: 0, width: 40 }}
            transition={{ duration: 0.25 }}
            flexDirection="column"
            flex={2}
          >
            {sidebar !== null && <Members our={false} />}
          </Flex>
        )}
      </AnimatePresence>
    );
  }, [sidebar, members]);
  if (!currentSpace) return null;
  const membersCount = membership.getMemberCount(currentSpace.path);

  const headerWidth = '50%';
  const paneWidth = '50%';
  return (
    <Flex flexDirection="row" width="100%" height="calc(100vh - 58px)">
      <Flex
        flex={1}
        overflowY="auto"
        height="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
      >
        <Flex
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          maxHeight={42}
          height={42}
          gap={12}
          mt={40}
          mb={46}
          minWidth={880}
          width={headerWidth}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <SpaceTitlebar
            space={currentSpace}
            theme={theme.currentTheme}
            membersCount={membersCount}
            showAppGrid={appGrid}
            showMembers={sidebar === 'members'}
            onToggleApps={() => {
              showAppGrid(!appGrid);
            }}
            onMemberClick={() => {
              setSidebar(!sidebar ? 'members' : null);
            }}
          />
        </Flex>

        <Flex
          flexGrow={1}
          flexDirection="row"
          justifyContent="space-between"
          gap={36}
          minWidth={880}
          width={paneWidth}
        >
          {appGrid && (
            <Flex flexDirection="column" justifyContent="flex-start" gap={20}>
              <Text variant="h3" fontWeight={500}>
                Your Apps
              </Text>
              <Flex
                style={{ position: 'relative' }}
                gap={32}
                width="880px"
                // mb="180px"
                flexWrap="wrap"
                flexDirection="row"
              >
                <AppGrid isOpen tileSize="xl2" />
              </Flex>
            </Flex>
          )}
          {!appGrid && (
            <Flex
              flex={4}
              flexGrow={1}
              position="relative"
              flexDirection="column"
              gap={16}
              mb="180px"
              initial="hidden"
              animate={isOpen ? 'show' : 'exit'}
              exit="hidden"
              variants={{
                hidden: {
                  opacity: 0,
                  transition: {
                    opacity: 0.3,
                    staggerChildren: 0,
                    delayChildren: 0,
                  },
                },
                show: {
                  opacity: 1,
                  x: sidebar ? -80 : 0,
                  transition: {
                    x: { duration: 0.25 },
                    opacity: 0.3,
                    staggerChildren: 0.1,
                    delayChildren: 0.1,
                  },
                },
                exit: {
                  opacity: 0,
                  transition: {
                    opacity: 0.3,
                    staggerChildren: 0,
                    delayChildren: 0,
                  },
                },
              }}
            >
              <AppSuite
                patp={ship!.patp!}
                space={currentSpace}
                apps={apps}
                suite={suite}
                isAdmin={isAdmin}
              />
              <RecommendedApps />
              <RecentActivity />
            </Flex>
          )}
          {sidebarComponent}
        </Flex>
      </Flex>
    </Flex>
  );
});
