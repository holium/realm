import { FC, useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import { Flex } from 'renderer/components';

import { SpaceTitlebar } from './Titlebar';
import { AppSuite } from './AppSuite';
import { RecommendedApps } from './Recommended';
import { RecentActivity } from './RecentActivity';
import { Members } from '../Members';

type HomePaneProps = {
  isOpen?: boolean;
};

type SidebarType = 'members' | null;

export const SpaceHome: FC<HomePaneProps> = observer((props: HomePaneProps) => {
  const { isOpen } = props;
  const { desktop, spaces, membership } = useServices();
  const currentSpace = spaces.selected;
  const [members, setMembers] = useState<any>([]);
  const [sidebar, setSidebar] = useState<SidebarType>(null);
  const [appGrid, showAppGrid] = useState(false);

  useEffect(() => {
    if (currentSpace) {
      const memberMap = membership.getMembersList(currentSpace.path);
      setMembers(memberMap);
    }
  }, [currentSpace]);

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
          width={headerWidth}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <SpaceTitlebar
            space={currentSpace}
            theme={desktop.theme}
            membersCount={members.length}
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
          width={paneWidth}
        >
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
            <AppSuite space={currentSpace} />
            <RecommendedApps />
            <RecentActivity />
          </Flex>
          {sidebarComponent}
        </Flex>
      </Flex>
    </Flex>
  );
});
