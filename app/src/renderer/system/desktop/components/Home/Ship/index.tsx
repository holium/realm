import { FC, useState, useMemo } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { rgba, darken } from 'polished';

import { AnimatePresence } from 'framer-motion';
import { Flex, Input, Icons, IconButton, Sigil } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { Members } from '../Members';
import { AppGrid } from './AppGrid';
import AppSearchApp from '../AppSearch';

type SidebarType = 'friends' | 'members' | null;

type OurHomeProps = {
  isOpen?: boolean;
};

export const OurHome: FC<OurHomeProps> = observer((props: OurHomeProps) => {
  const { isOpen } = props;
  const { friends, desktop, ship } = useServices();
  const [sidebar, setSidebar] = useState<SidebarType>(null);

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
            <Members our />
            {/* <Invitations /> */}
          </Flex>
        )}
      </AnimatePresence>
    );
  }, [sidebar, friends.all]);

  const highlightColor = '#4E9EFD';

  const iconHoverColor = useMemo(
    () => rgba(darken(0.03, desktop.theme.iconColor), 0.1),
    [desktop.theme.windowColor]
  );

  return (
    <Flex flexDirection="row" height="calc(100vh - 58px)">
      <Flex
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
          justifyContent={'center'}
          border={'solid 1px red'}
          width={'100%'}
        >
          <Flex>
            {ship && (
              <Sigil
                simple
                size={32}
                avatar={ship.avatar}
                patp={ship.patp}
                color={[ship.color || '#000000', 'white']}
              />
            )}
          </Flex>
          <AppSearchApp />
          <Flex justifyContent="flex-end">
            <IconButton
              size={3}
              customBg={iconHoverColor}
              color={
                sidebar === 'friends' ? highlightColor : desktop.theme.iconColor
              }
              onClick={() => {
                setSidebar(!sidebar ? 'friends' : null);
              }}
            >
              <Icons name="Members" size="22px" />
            </IconButton>
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
            gap={16}
            width="888px"
            mb="180px"
            flexWrap="wrap"
            flexDirection="row"
          >
            <AppGrid isOpen={isOpen} tileSize="xxl" />
          </Flex>
          {sidebarComponent}
        </Flex>
      </Flex>
    </Flex>
  );
});
