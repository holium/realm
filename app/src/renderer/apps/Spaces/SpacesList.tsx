import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Button, Icon, WindowedList } from '@holium/design-system';
// import { ActionButton } from 'renderer/components';
import { SpaceRow } from './SpaceRow';
import { VisaRow } from './components/VisaRow';
import { rgba } from 'polished';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';
import { useTrayApps } from '../store';

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
const scrollbarWidth = 12;

const SpacesListPresenter = ({
  selected,
  spaces,
  onSelect,
  onFindMore,
}: SpacesListProps) => {
  const { visas } = useServices();
  const { dimensions } = useTrayApps();
  const listWidth = useMemo(() => dimensions.width - 28, [dimensions.width]);

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
        width={dimensions.width - 28}
        gap={24}
      >
        <Text.Custom width={200} textAlign="center" opacity={0.5}>
          None of your groups have Spaces enabled.
        </Text.Custom>
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={12}
        >
          <Button.TextButton
            style={{
              width: 162,
              paddingRight: 8,
              justifyContent: 'space-between',
            }}
            tabIndex={-1}
            height={36}
            data-close-tray="true"
            onClick={() => {
              shellStore.openDialog('create-space-1');
            }}
          >
            Create one <Icon size={22} name="Plus" />
          </Button.TextButton>
          <Button.TextButton
            style={{
              width: 162,
              paddingRight: 8,
              justifyContent: 'space-between',
            }}
            tabIndex={-1}
            height={36}
            onClick={(evt) => {
              evt.stopPropagation();
              onFindMore();
            }}
          >
            Find spaces <Icon mr="2px" size={20} name="ArrowRightLine" />
          </Button.TextButton>
        </Flex>
      </Flex>
    );
  }

  return (
    <WindowedList
      key={`${spaces.length}-${incoming.length}`}
      width={listWidth + scrollbarWidth}
      data={rows}
      style={{ marginRight: -scrollbarWidth }}
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
  );
};

export const SpacesList = observer(SpacesListPresenter);
