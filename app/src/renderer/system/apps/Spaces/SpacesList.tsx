import { FC, useEffect, useState } from 'react';
import { SpaceModelType } from 'renderer/logic/space/store';

import { Grid } from '../../../components';
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
  return (
    <Grid.Column expand gap={4}>
      {spaces.map((space: SpaceModelType) => {
        return (
          <SpaceRow
            key={space.name}
            space={space}
            selected={selected?.id === space.id}
            onSelect={onSelect}
          />
        );
      })}
    </Grid.Column>
  );
};
