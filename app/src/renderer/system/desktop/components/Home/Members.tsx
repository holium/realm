import { FC, useRef, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { createField, createForm } from 'mobx-easy-form';
import { isValidPatp } from 'urbit-ob';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { rgba, lighten, darken } from 'polished';

import {
  Flex,
  Icons,
  Text,
  Input,
  TextButton,
  ShipSearch,
} from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { FriendsList } from './Ship/FriendsList';
import { MembersList } from './Space/MembersList';
import { ShipActions } from 'renderer/logic/actions/ship';

interface HomeSidebarProps {
  filterMode: 'light' | 'dark';
  customBg: string;
}

const HomeSidebar = styled(motion.div)<HomeSidebarProps>`
  position: relative;
  /* --webkit-backdrop-filter: var(--blur-enabled);
  --webkit-transform: transale3d(0, 0, 0); */
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  padding: 16px 16px 0 16px;
  width: 100%;
  height: 100%;
  gap: 16px;
`;

interface IMembers {
  our: boolean;
  friends?: any[];
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
  const { our } = props;
  const { theme, spaces, friends, membership } = useServices();
  const searchRef = useRef(null);

  const { inputColor, iconColor, textColor, windowColor, mode, dockColor } =
    theme.currentTheme;

  const { peopleForm, person } = useMemo(() => createPeopleForm(), []);
  // Ship search
  const [selectedPatp, setSelected] = useState<Set<string>>(new Set());
  const [selectedNickname, setSelectedNickname] = useState<Set<string>>(
    new Set()
  );

  const onShipSelected = (ship: [string, string?], metadata?: any) => {
    const patp = ship[0];
    const nickname = ship[1];
    if (our) {
      ShipActions.addFriend(patp);
    } else {
      SpacesActions.inviteMember(spaces.selected!.path, {
        patp,
        role: 'member',
        message: '',
      });
    }
    // const pendingAdd = selectedPatp;
    selectedPatp.add(patp);
    setSelected(new Set(selectedPatp));
    selectedNickname.add(nickname || '');
    setSelectedNickname(new Set(selectedNickname));
    // const updatedAll = all;
    // // TODO check the contact store for metadata
    // updatedAll.push({
    //   patp: patp,
    //   nickname: nickname,
    //   color: '#000000',
    //   ...metadata,
    // });
  };

  const themeInputColor = useMemo(
    () =>
      mode === 'light' ? lighten(0.2, inputColor) : darken(0.005, inputColor),
    [inputColor]
  );
  const backgroundColor = useMemo(
    () =>
      mode === 'light'
        ? lighten(0.025, rgba(dockColor, 0.9))
        : darken(0.05, rgba(dockColor, 0.9)),
    [dockColor]
  );

  return (
    <HomeSidebar
      filterMode={mode as 'light' | 'dark'}
      customBg={windowColor}
      onContextMenu={(evt: any) => {
        evt.stopPropagation();
      }}
      initial={{ background: backgroundColor }}
      animate={{
        background: backgroundColor,
      }}
      exit={{
        background: backgroundColor,
      }}
      transition={{ background: { duration: 0.5 } }}
    >
      <Flex flexDirection="row" alignItems="center" gap={10} mb={12}>
        <Icons name="Members" size="18px" opacity={0.5} />
        <Text fontWeight={500} fontSize={4} opacity={1}>
          {our ? 'Friends' : 'Members'}
        </Text>
      </Flex>
      <Flex position="relative">
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
          // bg={
          //   mode === 'light'
          //     ? lighten(0.2, inputColor)
          //     : darken(0.005, inputColor)
          // }
          wrapperMotionProps={{
            initial: {
              backgroundColor: themeInputColor,
            },
            animate: {
              backgroundColor: themeInputColor,
            },
            transition: {
              backgroundColor: { duration: 0.3 },
              borderColor: { duration: 0.3 },
              color: { duration: 0.5 },
            },
          }}
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
          error={
            person.computed.isDirty && person.computed.ifWasEverBlurredThenError
          }
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
      {our && <FriendsList friends={friends.list} />}
      {!our && <MembersList path={spaces.selected!.path} />}
    </HomeSidebar>
  );
});
