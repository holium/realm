import { FC, useRef, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { createField, createForm } from 'mobx-easy-form';
import { isValidPatp } from 'urbit-ob';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { rgba, lighten, darken } from 'polished';

import {
  Flex,
  Icons,
  Text,
  Input,
  TextButton,
  PersonRow,
  ShipSearch,
} from 'renderer/components';
import { useServices } from 'renderer/logic/store';

type HomeSidebarProps = {
  filterMode: 'light' | 'dark';
  customBg: string;
};

const HomeSidebar = styled(motion.div)<HomeSidebarProps>`
  background: ${(props: HomeSidebarProps) =>
    rgba(props.customBg, props.filterMode === 'light' ? 0.9 : 0.9)};
  position: relative;
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
  // Ship search
  const [selectedPatp, setSelected] = useState<Set<string>>(new Set());
  const [selectedNickname, setSelectedNickname] = useState<Set<string>>(
    new Set()
  );

  const rowBg = rgba(darken(0.075, windowColor), 0.5);

  const [pinned, setPinned] = useState(
    friends.filter((friend: any) => friend.pinned)
  );
  const [all, setAll] = useState(
    friends.filter((friend: any) => !friend.pinned)
  );

  const RowRenderer = (
    { index, style }: { index: number; style: any },
    usePinnedList: boolean
  ) => {
    const person = usePinnedList ? pinned[index] : all[index];

    return (
      <PersonRow
        patp={person.patp}
        nickname={person.nickname}
        sigilColor={person.color}
        avatar={person.avatar}
        description={person.description}
        listId="member-list"
        rowBg={rowBg}
        style={{ ...style }}
        theme={{
          textColor,
          windowColor,
        }}
        contextMenuOptions={
          usePinnedList
            ? [
                {
                  label: 'Unpin',
                  onClick: (evt: any) => {
                    console.log('unpin');
                  },
                },
                {
                  label: 'Remove',
                  onClick: (evt: any) => {
                    console.log('remove');
                  },
                },
              ]
            : [
                {
                  label: 'Pin',
                  onClick: (evt: any) => {
                    console.log('pin');
                  },
                },
                {
                  label: 'Remove',
                  onClick: (evt: any) => {
                    console.log('remove');
                  },
                },
              ]
        }
      />
    );
  };
  const onShipSelected = (ship: [string, string?], metadata?: any) => {
    const patp = ship[0];
    const nickname = ship[1];
    // const pendingAdd = selectedPatp;
    selectedPatp.add(patp);
    setSelected(new Set(selectedPatp));
    selectedNickname.add(nickname ? nickname : '');
    setSelectedNickname(new Set(selectedNickname));
    const updatedAll = all;
    updatedAll.push({
      patp: patp,
      nickname: nickname,
      color: '#000000',
      ...metadata,
    });
    setAll(updatedAll);
  };
  //
  const showHint =
    friends.length === 0 || (pinned.length > 0 && all.length === 0);
  return (
    <HomeSidebar
      filterMode={mode}
      customBg={windowColor}
      onContextMenu={(evt: any) => {
        evt.stopPropagation();
      }}
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
      <Flex position="relative" flex={1}>
        {/* Search and dropdown */}
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
            borderRadius: 6,
            paddingRight: 4,
          }}
          rightInteractive
          rightIcon={
            <TextButton
              disabled={!person.computed.parsed}
              onClick={(evt: any) => {
                onShipSelected([person.computed.parsed!, '']);
                person.actions.onChange('');
              }}
            >
              {our ? 'Add' : 'Invite'}
            </TextButton>
          }
          value={person.state.value}
          error={person.computed.ifWasEverBlurredThenError}
          onKeyDown={(evt: any) => {
            if (evt.key === 'Enter' && person.computed.parsed) {
              onShipSelected([person.computed.parsed, '']);
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
        <ShipSearch
          isDropdown
          heightOffset={0}
          search={person.state.value}
          selected={selectedPatp}
          customBg={windowColor}
          onSelected={(ship: [string, string?], metadata: any) => {
            onShipSelected(ship, metadata);
            person.actions.onChange('');
          }}
        />
      </Flex>

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
              itemSize={44}
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
