import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { SpaceModelType } from 'os/services/spaces/models/spaces';

import { Flex, Grid, Text, ActionButton, Icons } from 'renderer/components';
import { SpaceRow } from './SpaceRow';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { useServices } from 'renderer/logic/store';

export type Space = {
  color?: string;
  description?: string;
  picture: string;
  title: string;
  memberCount: number;
  token?: string;
};

type SpacesListProps = {
  selected?: SpaceModelType;
  spaces: SpaceModelType[];
  onSelect: (spaceKey: string) => void;
};

export const SpacesList: FC<SpacesListProps> = observer(
  (props: SpacesListProps) => {
    const { shell } = useServices();
    const { textColor, windowColor } = shell.desktop.theme;
    const { selected, spaces, onSelect } = props;
    if (!spaces.length) {
      return (
        <Flex
          flex={1}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={24}
        >
          <Text color={textColor} width={200} textAlign="center" opacity={0.3}>
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
                DesktopActions.openDialog('create-space-1');
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
      <Grid.Column expand gap={4}>
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
      </Grid.Column>
    );
  }
);
