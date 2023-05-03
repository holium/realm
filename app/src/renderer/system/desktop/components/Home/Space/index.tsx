import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { observer } from 'mobx-react';

import { Button, Flex, Icon, NoScrollBar } from '@holium/design-system';

import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { AppSearchApp } from '../AppInstall/AppSearch';
import { Members } from '../Members';
import { AppGrid } from '../Ship/AppGrid';
import { AppSuite } from './AppSuite/AppSuite';
import { RecommendedApps } from './Recommended';
import { SpaceTitlebar } from './SpaceTitlebar';

interface HomePaneProps {
  isOpen?: boolean;
  isOur: boolean;
}

type SidebarType = 'members' | 'friends' | null;

const HomePresenter = ({ isOpen, isOur }: HomePaneProps) => {
  const { loggedInAccount } = useAppState();
  const { spacesStore } = useShipStore();
  const currentSpace = spacesStore.selected;
  const [sidebar, setSidebar] = useState<SidebarType>(null);
  const [appGrid, showAppGrid] = useState(isOur ? true : false);

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
            <Members our={isOur} />
          </Flex>
        )}
      </AnimatePresence>
    );
  }, [sidebar, isOur]);

  if (!loggedInAccount) return null;
  if (!currentSpace) return null;

  const membersCount = currentSpace.members.count;
  const maxWidth = 880;

  const isAdmin = currentSpace.isAdmin();

  const shouldShowAppGrid = appGrid || isOur;

  return (
    <Flex flexDirection="row" width="100%" height="calc(100vh - 50px)">
      <NoScrollBar
        flex={8}
        overflowY="auto"
        height="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
      >
        {isOur ? (
          <Flex
            flex={8}
            style={{ position: 'relative' }}
            initial={{ opacity: 0 }}
            animate={isOpen ? 'show' : 'exit'}
            exit={{ opacity: 0 }}
            maxHeight={44}
            height={44}
            gap={12}
            mb={40}
            mt={40}
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            width="100%"
            variants={{
              hidden: {
                opacity: 0,
              },
              show: {
                opacity: 1,
                x: sidebar ? -80 : 0,
                transition: {
                  duration: 1,
                  x: { duration: 0.25 },
                },
              },
              exit: {
                opacity: 0,
              },
            }}
          >
            {/* TODO replace with updater dropdown */}
            {/* {ship && (
              <Avatar
                simple
                size={32}
                avatar={loggedInAccount.avatar}
                patp={loggedInAccount.serverId}
                sigilColor={[loggedInAccount.color || '#000000', 'white']}
              />
            )} */}
            <AppSearchApp mode="home" />
            <Flex justifyContent="flex-end">
              <Button.IconButton
                size={32}
                onClick={() => {
                  setSidebar(!sidebar ? 'friends' : null);
                }}
              >
                <Icon name="Members" size={22} opacity={0.7} />
              </Button.IconButton>
            </Flex>
          </Flex>
        ) : (
          <Flex
            initial={{ opacity: 0 }}
            style={{ position: 'relative' }}
            animate={isOpen ? 'show' : 'exit'}
            exit={{ opacity: 0 }}
            maxHeight={44}
            height={44}
            gap={12}
            mt={40}
            mb={40}
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
        )}
        <Flex
          flexGrow={1}
          flexDirection="row"
          justifyContent="space-between"
          gap={36}
          width={maxWidth}
        >
          {shouldShowAppGrid ? (
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
              {/* <Text.H4 height={20} fontWeight={500}>
                {isOur ? '' : 'Your Apps'}
              </Text.H4> */}
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
          ) : (
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
                patp={loggedInAccount.serverId}
                isAdmin={isAdmin as boolean}
              />
              <RecommendedApps />
              {/* <RecentActivity /> */}
            </Flex>
          )}
          {sidebarComponent}
        </Flex>
      </NoScrollBar>
    </Flex>
  );
};

export const Home = observer(HomePresenter);
