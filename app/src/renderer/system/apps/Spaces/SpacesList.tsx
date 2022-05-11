import { FC, useEffect, useState } from 'react';

import { Grid } from '../../../components';
import { SpaceRow } from './SpaceRow';

const sampleSpaces: Space[] = [
  {
    title: 'Other Life',
    picture:
      'https://dl.airtable.com/.attachmentThumbnails/85973e6c8ac12bef0ce4fbc046a2fb7c/8c21d303',
    memberCount: 1261,
    token: '$LIFE',
  },
  {
    title: 'The Swolesome Fund',
    picture:
      'https://archiv.nyc3.digitaloceanspaces.com/littel-wolfur/2022.2.13..05.27.08-jacked.png',
    memberCount: 60,
    token: '$SWOL',
  },
];

export type Space = {
  color?: string;
  description?: string;
  picture: string;
  title: string;
  memberCount: number;
  token?: string;
};

type SpacesListProps = {
  spaces: Space[];
};

export const SpacesList: FC<SpacesListProps> = (props: SpacesListProps) => {
  const { spaces } = props;
  return (
    <Grid.Column expand gap={4}>
      {sampleSpaces.map((space: Space) => {
        return <SpaceRow key={space.title} space={space} />;
      })}
    </Grid.Column>
  );
};
