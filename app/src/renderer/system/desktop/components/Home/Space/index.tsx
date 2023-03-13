import { useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import { AnimatePresence } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import { Flex, Text } from 'renderer/components';

import { SpaceTitlebar } from './SpaceTitlebar';
import { AppSuite } from './AppSuite/AppSuite';
import { RecommendedApps } from './Recommended';
import { Members } from '../Members';
import { AppGrid } from '../Ship/AppGrid';

interface HomePaneProps {
  isOpen?: boolean;
}

type SidebarType = 'members' | null;

const SpaceHomePresenter = (props: HomePaneProps) => {
  const { isOpen } = props;
  const { ship, spaces, membership } = useServices();
  const currentSpace = spaces.selected;
  const [sidebar, setSidebar] = useState<SidebarType>(null);
  const [appGrid, showAppGrid] = useState(false);

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
  }, [sidebar]);

  if (!ship) return null;
  if (!currentSpace) return null;

  const membersCount = membership.getMemberCount(currentSpace.path);
  const maxWidth = 880;

  const isAdmin = membership.isAdmin(currentSpace.path, ship.patp);

  return (
    <Flex flexDirection="row" width="100%" height="calc(100vh - 50px)">
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
          animate={isOpen ? 'show' : 'exit'}
          exit={{ opacity: 0 }}
          maxHeight={42}
          height={42}
          gap={12}
          mt={40}
          mb={46}
          width={maxWidth}
          variants={{
            hidden: {
              opacity: 0,
            },
            show: {
              opacity: 1,
              x: sidebar ? -80 : 0,
              transition: {
                x: { duration: 0.25 },
              },
            },
            exit: {
              opacity: 0,
            },
          }}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <SpaceTitlebar
            space={currentSpace}
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
          width={maxWidth}
        >
          {appGrid && (
            <Flex
              animate={isOpen ? 'show' : 'exit'}
              flexDirection="column"
              justifyContent="flex-start"
              variants={{
                hidden: {
                  opacity: 0,
                },
                show: {
                  opacity: 1,
                  x: sidebar ? -80 : 0,
                  transition: {
                    x: { duration: 0.25 },
                  },
                },
                exit: {
                  opacity: 0,
                },
              }}
              gap={20}
            >
              <Text variant="h3" fontWeight={500}>
                Your Apps
              </Text>
              <Flex
                style={{ position: 'relative' }}
                gap={32}
                width={maxWidth}
                flexWrap="wrap"
                flexDirection="row"
              >
                <AppGrid tileSize="xl2" />
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
              <AppSuite patp={ship.patp} isAdmin={isAdmin as boolean} />
              <RecommendedApps />
              {/* <RecentActivity /> */}
            </Flex>
          )}
          {sidebarComponent}
        </Flex>
      </Flex>
    </Flex>
  );
};

export const SpaceHome = observer(SpaceHomePresenter);
