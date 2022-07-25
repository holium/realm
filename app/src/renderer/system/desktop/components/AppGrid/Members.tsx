import { FC, useRef, useMemo, createRef } from 'react';
import { observer } from 'mobx-react-lite';
import { createField, createForm } from 'mobx-easy-form';
import { isValidPatp } from 'urbit-ob';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { rgba, lighten, darken } from 'polished';
import { Portal } from 'renderer/system/dialog/Portal';
import { AnimatePresence } from 'framer-motion';
import {
  Flex,
  Icons,
  Text,
  Input,
  TextButton,
  Box,
  Sigil,
  ContextMenu,
} from 'renderer/components';
import { Row } from 'renderer/components/NewRow';
import { useServices } from 'renderer/logic/store';
import { HotModuleReplacementPlugin } from 'webpack';

type HomeSidebarProps = {
  filterMode: 'light' | 'dark';
  customBg: string;
};

const HomeSidebar = styled(motion.div)<HomeSidebarProps>`
  background: ${(props: HomeSidebarProps) =>
    rgba(props.customBg, props.filterMode === 'light' ? 0.9 : 0.9)};
  backdrop-filter: var(--blur-enabled);
  transform: transale3d(0, 0, 0);
  border-radius: 12px;
  padding: 16px 16px 0 16px;
  width: 100%;
  height: 100%;
  gap: 16px;
`;

interface IMembers {
  our: boolean;
  friends: any[];
}

export const createPeopleForm = (
  defaults: any = {
    person: '',
  }
) => {
  const peopleForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const person = createField({
    id: 'person',
    form: peopleForm,
    initialValue: defaults.person || '',
    validate: (patp: string) => {
      if (patp.length > 1 && isValidPatp(patp)) {
        return { error: undefined, parsed: patp };
      }
      return { error: 'Invalid patp', parsed: undefined };
    },
  });

  return {
    peopleForm,
    person,
  };
};

export const Members: FC<IMembers> = observer((props: IMembers) => {
  const { our, friends } = props;
  const { shell, spaces } = useServices();
  const searchRef = useRef(null);

  const { inputColor, iconColor, textColor, windowColor, mode, dockColor } =
    shell.desktop.theme;

  const { peopleForm, person } = useMemo(() => createPeopleForm(), []);

  const rowBg = rgba(darken(0.075, windowColor), 0.5);

  const pinned = friends.filter((friend: any) => friend.pinned);
  const all = friends.filter((friend: any) => !friend.pinned);

  const RowRenderer = (
    { index, style }: { index: number; style: any },
    usePinnedList: boolean
  ) => {
    const friend = usePinnedList ? pinned[index] : all[index];
    const nickname = friend.nickname;
    const sigilColor = friend.color;
    const avatar = friend.avatar;
    const rowRef = useRef(null);
    const id = `member-list-${spaces.selected!.path}-${friend.patp}`;
    return (
      <div
        id={id}
        ref={rowRef}
        key={friend.patp}
        style={{ position: 'relative', ...style }}
      >
        <Portal>
          <AnimatePresence>
            <ContextMenu
              position="below"
              isComponentContext
              textColor={textColor}
              customBg={windowColor}
              containerId={id}
              parentRef={rowRef}
              style={{ minWidth: 180 }}
              menu={[
                {
                  label: 'App info',
                  disabled: true,
                  onClick: (evt: any) => {
                    // evt.stopPropagation();
                    console.log('open app info');
                  },
                },
              ]}
            />
          </AnimatePresence>
        </Portal>
        <Row
          style={{ justifyContent: 'space-between' }}
          customBg={rowBg}
          onClick={(evt: any) => {
            evt.stopPropagation();
          }}
        >
          <Flex gap={10} flexDirection="row" alignItems="center">
            <Box>
              <Sigil
                simple
                size={22}
                avatar={avatar}
                patp={friend.patp}
                color={[sigilColor || '#000000', 'white']}
              />
            </Box>
            {nickname ? (
              <>
                <Text fontSize={2}>
                  {nickname.substring(0, 20)} {nickname.length > 21 && '...'}
                </Text>
                <Text fontSize={2} opacity={0.7}>
                  {friend.patp}
                </Text>
              </>
            ) : (
              <Text fontSize={2}>{friend.patp}</Text>
            )}
          </Flex>
        </Row>
      </div>
    );
  };
  //
  const showHint =
    friends.length === 0 || (pinned.length > 0 && all.length === 0);
  return (
    <HomeSidebar
      filterMode={mode}
      customBg={windowColor}
      animate={{
        background:
          mode === 'light'
            ? lighten(0.025, rgba(dockColor, 0.9))
            : darken(0.05, rgba(dockColor, 0.9)),
        transition: { background: { duration: 1 } },
      }}
    >
      <Flex flexDirection="row" alignItems="center" gap={10} mb={12}>
        <Icons name="Members" size="18px" opacity={0.5} />
        <Text fontWeight={500} fontSize={4} opacity={1}>
          {our ? 'Friends' : 'Members'}
        </Text>
      </Flex>
      <Input
        tabIndex={1}
        autoCapitalize="false"
        autoCorrect="false"
        autoComplete="false"
        name="person"
        ref={searchRef}
        height={34}
        placeholder="Search..."
        bg={
          mode === 'light'
            ? lighten(0.2, inputColor)
            : darken(0.005, inputColor)
        }
        wrapperStyle={{
          // backgroundColor:
          //   mode === 'light'
          //     ? lighten(0.2, inputColor)
          // : darken(0.005, inputColor),
          borderRadius: 6,
          paddingRight: 4,
        }}
        rightInteractive
        rightIcon={<TextButton>{our ? 'Add' : 'Invite'}</TextButton>}
        value={person.state.value}
        error={person.computed.ifWasEverBlurredThenError}
        onKeyDown={(evt: any) => {
          if (evt.key === 'Enter' && person.computed.parsed) {
            // onShipSelected([person.computed.parsed, '']);
            person.actions.onChange('');
          }
        }}
        onChange={(e: any) => {
          person.actions.onChange(e.target.value);
        }}
        onFocus={() => {
          person.actions.onFocus();
        }}
        onBlur={() => {
          person.actions.onBlur();
        }}
      />
      <Flex mt={18} height={24 + pinned.length * 42} flexDirection="column">
        <Text
          style={{ textTransform: 'uppercase' }}
          fontSize={1}
          fontWeight={600}
          opacity={0.6}
          ml="2px"
          mb="4px"
        >
          Pinned
        </Text>
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <List
              className="List"
              height={height}
              itemCount={pinned.length}
              itemSize={40}
              width={width}
            >
              {(pinProps: { index: number; style: any }) =>
                RowRenderer(pinProps, true)
              }
            </List>
          )}
        </AutoSizer>
      </Flex>
      <Flex mt={18} height={24 + all.length * 42} flexDirection="column">
        <Text
          style={{ textTransform: 'uppercase' }}
          fontSize={1}
          fontWeight={600}
          opacity={0.6}
          ml="2px"
          mb="4px"
        >
          All
        </Text>
        {showHint && (
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height={40}
          >
            <Text fontSize={2} opacity={0.5}>
              {pinned.length > 0 &&
                all.length === 0 &&
                'All your friends are pinned'}
              {friends.length === 0 && 'Add some friends above'}
            </Text>
          </Flex>
        )}
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <List
              className="List"
              height={height}
              itemCount={all.length}
              itemSize={40}
              width={width}
            >
              {(pinProps: { index: number; style: any }) =>
                RowRenderer(pinProps, false)
              }
            </List>
          )}
        </AutoSizer>
      </Flex>
    </HomeSidebar>
  );
});
