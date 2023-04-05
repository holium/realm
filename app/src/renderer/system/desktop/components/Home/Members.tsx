import { useRef, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { createField, createForm } from 'mobx-easy-form';
import { isValidPatp } from 'urbit-ob';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Flex, Icons, Text, Input, ShipSearch } from 'renderer/components';
import { Button, TextInput } from '@holium/design-system';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { FriendsList } from './Ship/FriendsList';
import { MembersList } from './Space/MembersList';
import { ShipActions } from 'renderer/logic/actions/ship';
import { useShipStore } from 'renderer/stores/ship.store';

const HomeSidebar = styled(motion.div)`
  position: relative;
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

const MembersPresenter = ({ our }: IMembers) => {
  const { spacesStore } = useShipStore();
  const searchRef = useRef(null);

  const { person } = useMemo(() => createPeopleForm(), []);
  // Ship search
  const [selectedPatp, setSelected] = useState<Set<string>>(new Set());
  const [selectedNickname, setSelectedNickname] = useState<Set<string>>(
    new Set()
  );
  const currentSpace = spacesStore.selected;
  if (!currentSpace) return null;

  const onShipSelected = (ship: [string, string?]) => {
    const patp = ship[0];
    const nickname = ship[1];
    if (our) {
      ShipActions.addFriend(patp);
    } else {
      SpacesActions.inviteMember(currentSpace.path ?? '', {
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

  return (
    <HomeSidebar
      onContextMenu={(evt: any) => {
        evt.stopPropagation();
      }}
    >
      <Flex flexDirection="row" alignItems="center" gap={10} mb={12}>
        <Icons name="Members" size="18px" opacity={0.5} />
        <Text fontWeight={500} fontSize={4} opacity={1}>
          {our ? 'Friends' : 'Members'}
        </Text>
      </Flex>
      <Flex position="relative">
        {/* Search and dropdown */}
        <TextInput
          tabIndex={1}
          autoCapitalize="false"
          autoCorrect="false"
          autoComplete="false"
          name="person"
          id="person"
          ref={searchRef}
          height={34}
          placeholder="Search..."
          rightAdornment={
            <Button.TextButton
              disabled={!person.computed.parsed}
              onClick={() => {
                onShipSelected([person.computed.parsed ?? '', '']);
                person.actions.onChange('');
              }}
            >
              {our ? 'Add' : 'Invite'}
            </Button.TextButton>
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
          search={person.state.value}
          selected={selectedPatp}
          onSelected={(ship: [string, string?]) => {
            onShipSelected(ship);
            person.actions.onChange('');
          }}
        />
      </Flex>
      {our && <FriendsList />}
      {!our && <MembersList />}
    </HomeSidebar>
  );
};

export const Members = observer(MembersPresenter);
