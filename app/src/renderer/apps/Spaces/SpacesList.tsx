import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { WindowedList } from '@holium/design-system';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { Flex, Text, ActionButton, Icons } from 'renderer/components';
import { SpaceRow } from './SpaceRow';
import { ShellActions } from 'renderer/logic/actions/shell';
import { useServices } from 'renderer/logic/store';
import { VisaRow } from './components/VisaRow';
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
  onFindMore: () => void;
}

const SpacesListPresenter = ({
  selected,
  spaces,
  onSelect,
  onFindMore,
}: SpacesListProps) => {
  const { theme, visas } = useServices();
  const { textColor } = theme.currentTheme;

  const highlightColor = useMemo(() => rgba('#4E9EFD', 0.05), []);

  const incoming = Array.from(visas.incoming.values());

  type SpaceRowValue = (typeof spaces)[number];
  type VisaRowValue = (typeof incoming)[number];
  type Rows = {
    space?: SpaceRowValue;
    visa?: VisaRowValue;
  }[];

  const rows: Rows = useMemo(
    () => [
      ...incoming.map((visa) => ({
        visa,
      })),
      ...spaces.map((space) => ({
        space,
      })),
    ],
    [incoming, spaces]
  );

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
            onClick={() => {
              ShellActions.openDialog('create-space-1');
            }}
          >
            Create one
          </ActionButton>
          <ActionButton
            style={{ width: 162, paddingRight: 8 }}
            tabIndex={-1}
            height={36}
            rightContent={<Icons mr="2px" size="22px" name="ArrowRightLine" />}
            onClick={(evt) => {
              evt.stopPropagation();
              onFindMore();
            }}
          >
            Find spaces
          </ActionButton>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex flex={1} width="100%">
      <WindowedList
        key={`${spaces.length}-${incoming.length}`}
        width={354}
        data={rows}
        itemContent={(_, { space, visa }) => {
          if (space) {
            return (
              <SpaceRow
                key={`space-${space.path}`}
                space={space}
                selected={selected?.path === space.path}
                onSelect={onSelect}
              />
            );
          }
          const visaRowValue = visa as VisaRowValue;
          return (
            <VisaRow
              key={`visa-${visaRowValue.path}`}
              image={visaRowValue.picture}
              color={visaRowValue.color}
              path={visaRowValue.path}
              customBg={highlightColor}
              invitedBy={visaRowValue.inviter}
              title={visaRowValue.name}
            />
          );
        }}
      />
    </Flex>
  );
};

export const SpacesList = observer(SpacesListPresenter);
