import { FC, useEffect, useState } from 'react';
import { SpaceModelType } from 'os/services/spaces/models/spaces';

import { Flex, Grid, Text, ActionButton, Icons } from 'renderer/components';
import { SpaceRow } from './SpaceRow';

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

export const SpacesList: FC<SpacesListProps> = (props: SpacesListProps) => {
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
        <Text width={200} textAlign="center" opacity={0.6}>
          None of your groups have Spaces enabled.
        </Text>
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={12}
        >
          <ActionButton
            style={{ maxWidth: 200 }}
            tabIndex={-1}
            height={32}
            rightContent={<Icons ml={2} size={2} name="Plus" />}
          >
            Create one
          </ActionButton>
          {/* <ActionButton
            style={{ maxWidth: 200 }}
            tabIndex={-1}
            height={32}
            rightContent={<Icons ml={2} size={1} name="ArrowRightLine" />}
          >
            Find spaces
          </ActionButton> */}
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
};
