import React from 'react';
import styled, { css } from 'styled-components';
import { rgba } from 'polished';
import { AppType } from 'os/services/spaces/models/bazaar';
import { SuiteAppTile } from './SuiteAppTile';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';
import { Box, BoxProps, Icon } from '@holium/design-system';

type AppEmptyProps = {
  isSelected: boolean;
  isAdmin: boolean | undefined;
} & BoxProps;

const AppEmpty = styled(Box)<AppEmptyProps>`
  border-radius: 20px;
  /* border: 2px dotted white; */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
  ${(props: AppEmptyProps) =>
    css`
      ${props.isSelected && `border: 2px solid rgba(var(--rlm-accent-rgba))`};
      background: ${rgba('#FBFBFB', props.isAdmin ? 0.4 : 0.1)};
      &:hover {
        transition: 0.2s ease;
        background: ${rgba('#FFFFFF', props.isAdmin ? 0.5 : 0.2)};
      }
    `};
`;

interface SuiteAppProps {
  id: string;
  index: number;
  selected: boolean;
  space: SpaceModelType;
  highlightColor?: string;
  app?: AppType;
  isAdmin?: boolean;
  onClick?: (e: React.MouseEvent<any, MouseEvent>, app?: any) => void;
}

export const SuiteApp = ({
  id,
  selected,
  index,
  app,
  space,
  isAdmin,
  onClick,
}: SuiteAppProps) => {
  if (!app) {
    return (
      <AppEmpty
        id={id}
        height={160}
        width={160}
        isSelected={selected}
        isAdmin={isAdmin}
        onClick={(e) => onClick && onClick(e, undefined)}
      >
        {isAdmin && (
          <Icon size={24} name="Plus" iconColor={'#FFFFFF'} opacity={0.4} />
        )}
      </AppEmpty>
    );
  }

  return (
    <SuiteAppTile index={index} app={app} space={space} isAdmin={isAdmin} />
  );
};
