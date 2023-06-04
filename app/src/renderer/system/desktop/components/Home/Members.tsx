import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import styled, { css } from 'styled-components';
import { isValidPatp } from 'urbit-ob';

import { Button, Flex, Icon, Text, TextInput } from '@holium/design-system';

import { ShipSearch } from 'renderer/components/ShipSearch';
import { useAppState } from 'renderer/stores/app.store';
import { shipStore, useShipStore } from 'renderer/stores/ship.store';

import { MembersList } from './Space/MembersList';

type HomeSidebarProps = {
  isFullscreen: boolean;
};

const HomeSidebar = styled(motion.div)<HomeSidebarProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  padding: 16px 16px 0 16px;
  ${(props) =>
    !props.isFullscreen &&
    css`
      margin-top: 30px;
    `}
  width: 100%;
  height: 100%;
  gap: 16px;
  background: rgba(var(--rlm-window-rgba), 0.9);
  backdrop-filter: var(--blur);
`;

interface IMembers {
  our: boolean;
  onMemberClick: () => void;
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

const MembersPresenter = ({ our, onMemberClick }: IMembers) => {
  const { spacesStore } = useShipStore();
  const { shellStore } = useAppState();
  const searchRef = useRef(null);

  const { person } = useMemo(() => createPeopleForm(), []);
  // Ship search
  const [selectedIdentity, setSelectedIdentity] = useState<Set<string>>(
    new Set()
  );
  const [selectedNickname, setSelectedNickname] = useState<Set<string>>(
    new Set()
  );
  const currentSpace = spacesStore.selected;
  if (!currentSpace) return null;

  const onShipSelected = (ship: [string, string?]) => {
    const patp = ship[0];
    const nickname = ship[1];
    if (our) {
      shipStore.friends.addFriend(patp);
    } else {
      currentSpace.path &&
        shipStore.spacesStore.inviteMember(currentSpace.path, patp);
    }
    // const pendingAdd = selectedIdentity;
    selectedIdentity.add(patp);
    setSelectedIdentity(new Set(selectedIdentity));
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
      isFullscreen={shellStore.isFullscreen}
    >
      <Flex flexDirection="row" alignItems="center" gap={10} mb={12}>
        <Icon name="Members" size={18} opacity={0.5} />
        <Text.Custom fontWeight={500} fontSize={4} opacity={1}>
          {our ? 'Friends' : 'Members'}
        </Text.Custom>
        <Button.IconButton
          onClick={onMemberClick}
          style={{
            marginLeft: 'auto',
          }}
        >
          <Icon name="ChevronRight" size={18} opacity={0.7} />
        </Button.IconButton>
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
          width="100%"
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
          selected={selectedIdentity}
          onSelected={(ship: [string, string?]) => {
            onShipSelected(ship);
            person.actions.onChange('');
          }}
        />
      </Flex>
      <MembersList our={our} />
    </HomeSidebar>
  );
};

export const Members = observer(MembersPresenter);
