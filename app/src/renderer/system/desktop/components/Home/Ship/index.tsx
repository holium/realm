import { useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import { AnimatePresence } from 'framer-motion';
import { Members } from '../Members';
import { AppGrid } from './AppGrid';
import { AppSearchApp } from '../AppInstall/AppSearch';
import { NoScrollBar } from 'renderer/components/NoScrollbar';
import { Avatar, Flex, Button, Icon } from '@holium/design-system';
import { useShipStore } from 'renderer/stores/ship.store';

type SidebarType = 'friends' | 'members' | null;

interface OurHomeProps {
  isOpen?: boolean;
}

const OurHomePresenter = (props: OurHomeProps) => {
  const { isOpen } = props;
  const { ship } = useShipStore();
  const [sidebar, setSidebar] = useState<SidebarType>(null);

  const sidebarComponent = useMemo(
    () => (
      <AnimatePresence>
        {sidebar !== null && (
          <Flex
            position="absolute"
            right="8px"
            top="8px"
            bottom={58}
            initial={{ opacity: 0, x: '88%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '88%' }}
            transition={{ duration: 0.25 }}
            flexDirection="column"
            flex={2}
          >
            <Members our />
          </Flex>
        )}
      </AnimatePresence>
    ),
    [sidebar]
  );

  return (
    <Flex flexDirection="row" height="calc(100vh - 50px)">
      <NoScrollBar
        flex={8}
        overflowY="auto"
        height="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
      >
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
          <Flex>
            {ship && (
              <Avatar
                simple
                size={32}
                avatar={ship.avatar}
                patp={ship.patp}
                sigilColor={[ship.color || '#000000', 'white']}
              />
            )}
          </Flex>
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
        <Flex flexDirection="row" justifyContent="space-between" gap={36}>
          <Flex
            variants={{
              hidden: {
                opacity: 0,
                transition: {
                  opacity: 0.3,
                },
              },
              show: {
                opacity: 1,
                x: sidebar ? -80 : 0,
                transition: {
                  x: { duration: 0.25 },
                  opacity: 0.3,
                },
              },
              exit: {
                opacity: 0,
                transition: {
                  opacity: 0.3,
                },
              },
            }}
            style={{ position: 'relative' }}
            initial="hidden"
            animate={isOpen ? 'show' : 'exit'}
            exit="hidden"
            gap={32}
            width="888px"
            mb="170px"
            flexWrap="wrap"
            flexDirection="row"
          >
            <AppGrid tileSize="xl2" />
          </Flex>
          {sidebarComponent}
        </Flex>
      </NoScrollBar>
    </Flex>
  );
};

export const OurHome = observer(OurHomePresenter);
