import { FC, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { SpaceModelType } from 'os/services/spaces/models/spaces';

import { Flex, Text, ActionButton, Icons } from 'renderer/components';
import { SpaceRow } from './SpaceRow';
import { ShellActions } from 'renderer/logic/actions/shell';
import { useServices } from 'renderer/logic/store';
import { VisaRow } from './components/VisaRow';
import { VisaType } from 'os/services/spaces/models/visas';
import { rgba } from 'polished';

export interface Space {
  color?: string;
  description?: string;
  picture: string;
  title: string;
  memberCount: number;
  token?: string;
}

interface SpacesListProps {
  selected?: SpaceModelType;
  spaces: SpaceModelType[];
  onSelect: (spaceKey: string) => void;
}

export const SpacesList: FC<SpacesListProps> = observer(
  (props: SpacesListProps) => {
    const { theme, visas } = useServices();
    const { textColor, windowColor } = theme.currentTheme;
    const { selected, spaces, onSelect } = props;
    // const [visas, setVisas] = useState([]);
    const [loadingVisa, setLoading] = useState(true);

    useEffect(() => {
      // SpacesActions.getInvitations()
      //   .then((invites: any) => {
      //     console.log(invites);
      //     setLoading(false);
      //     setVisas(Object.values(invites));
      //   })
      //   .catch(() => setLoading(false));
    }, []);

    const highlightColor = useMemo(() => rgba('#4E9EFD', 0.05), []);

    const incoming = Array.from(visas.incoming.values());

    if (!spaces.length && !incoming.length) {
      return (
        <Flex
          flex={1}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={24}
        >
          <Text color={textColor} width={200} textAlign="center" opacity={0.5}>
            None of your groups have Spaces enabled.
          </Text>
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap={12}
          >
            <ActionButton
              style={{ width: 162, paddingRight: 8 }}
              tabIndex={-1}
              height={36}
              rightContent={<Icons size={2} name="Plus" />}
              data-close-tray="true"
              onClick={(evt: any) => {
                ShellActions.openDialog('create-space-1');
              }}
            >
              Create one
            </ActionButton>
            <ActionButton
              style={{ width: 162, paddingRight: 8 }}
              tabIndex={-1}
              height={36}
              rightContent={
                <Icons mr="2px" size="22px" name="ArrowRightLine" />
              }
              data-close-tray="true"
            >
              Find spaces
            </ActionButton>
          </Flex>
        </Flex>
      );
    }
    return (
      <Flex
        px={10}
        gap={4}
        flex={1}
        width="100%"
        flexDirection="column"
        overflowY="scroll"
      >
        {incoming.map((visa: VisaType) => {
          return (
            <VisaRow
              key={visa.name}
              image={visa.picture}
              color={visa.color}
              path={visa.path}
              customBg={highlightColor}
              invitedBy={visa.inviter}
              title={visa.name}
            />
          );
        })}
        {spaces.map((space: SpaceModelType) => {
          return (
            <SpaceRow
              key={space.name}
              space={space}
              selected={selected?.path === space.path}
              onSelect={onSelect}
            />
          );
        })}
      </Flex>
    );
  }
);
