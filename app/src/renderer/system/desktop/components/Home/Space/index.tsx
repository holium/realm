import { useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import { AnimatePresence } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import { Flex, Text, IconButton } from 'renderer/components';
import { rgba, darken } from 'polished';
import { SpaceTitlebar } from './SpaceTitlebar';
import { AppSuite } from './AppSuite/AppSuite';
import { RecommendedApps } from './Recommended';
import { Members } from '../Members';
import { AppGrid } from '../Ship/AppGrid';
import { NoScrollBar } from 'renderer/components/NoScrollbar';
import { Avatar, Icon } from '@holium/design-system';
import { AppSearchApp } from '../AppInstall/AppSearch';

interface HomePaneProps {
  isOpen?: boolean;
  isOur: boolean;
}

type SidebarType = 'members' | 'friends' | null;

const HomePresenter = (props: HomePaneProps) => {
  const { isOpen, isOur } = props;
  const { ship, spaces, membership, theme } = useServices();
  const currentSpace = spaces.selected;
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
            {sidebar !== null && <Members our={isOur} />}
          </Flex>
        )}
      </AnimatePresence>
    );
  }, [sidebar, isOur]);

  const highlightColor = '#4E9EFD';
  const iconHoverColor = useMemo(
    () => rgba(darken(0.03, theme.currentTheme.iconColor), 0.1),
    [theme.currentTheme.iconColor]
  );

  if (!ship) return null;
  if (!currentSpace) return null;

  const membersCount = membership.getMemberCount(currentSpace.path);
  const maxWidth = 880;

  const isAdmin = membership.isAdmin(currentSpace.path, ship.patp);

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
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            maxHeight={42}
            height={42}
            gap={12}
            mb={40}
            mt={40}
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            width="100%"
          >
            {ship && (
              <Avatar
                simple
                size={32}
                avatar={ship.avatar}
                patp={ship.patp}
                sigilColor={[ship.color || '#000000', 'white']}
              />
            )}
            <AppSearchApp mode="home" />
            <Flex justifyContent="flex-end">
              <IconButton
                size={3}
                customBg={iconHoverColor}
                color={
                  sidebar === 'friends'
                    ? highlightColor
                    : theme.currentTheme.iconColor
                }
                onClick={() => {
                  setSidebar(!sidebar ? 'friends' : null);
                }}
              >
                <Icon name="Members" size="22px" />
              </IconButton>
            </Flex>
          </Flex>
        ) : (
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
              <AppSuite patp={ship.patp} isAdmin={isAdmin as boolean} />
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
