import { FC } from 'react';
import styled, { css } from 'styled-components';
import { Crest } from 'renderer/components';
import { Flex, Text, Icon } from '@holium/design-system';
import { pluralize } from 'renderer/logic/lib/text';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';

interface SpacePictureProps {
  space: SpaceModelType;
  size?: number;
  membersCount?: number;
}

interface PictureProps {
  size?: number;
}

const EmptyPicture = styled.div<PictureProps>`
  ${(props: PictureProps) => css`
    height: ${props.size}px;
    width: ${props.size}px;
  `}
  background: ${(p: any) => p.color || '#000'};
  border-radius: 6px;
`;

const FadeInMotion = {
  initial: { opacity: 0 },
  exit: { opacity: 0 },
  animate: {
    opacity: 1,
  },
  transition: { opacity: { duration: 1, ease: 'easeIn' } },
};

export const SpacePicture: FC<SpacePictureProps> = (
  props: SpacePictureProps
) => {
  const { space, size, membersCount } = props;

  return (
    <Flex gap={12} flexDirection="row" alignItems="center">
      {/* Outer row */}
      {space.picture || space.color ? (
        <Crest
          color={space.color || ''}
          picture={space.picture || ''}
          size="sm2"
        />
      ) : (
        <EmptyPicture size={size} />
      )}
      <Flex
        flexDirection="column"
        justifyContent="center"
        gap={4}
        {...FadeInMotion}
      >
        {/* Title column */}
        <Text.Custom
          transition={{ color: { duration: 0.5 } }}
          fontSize={4}
          fontWeight={500}
        >
          {space.name}
        </Text.Custom>
        <Flex gap={10} alignItems="center">
          {/* Subtitle row */}
          <Flex gap={4} alignItems="center">
            {/* Member count */}
            <Icon
              name="Members"
              size={14}
              transition={{ fill: { duration: 0.5 } }}
              opacity={0.7}
            />
            <Text.Custom
              transition={{ color: { duration: 0.5 } }}
              opacity={0.7}
              fontSize={2}
              fontWeight={400}
            >
              {membersCount} {membersCount && pluralize('member', membersCount)}
            </Text.Custom>
          </Flex>
          {/* {space.token && (
            <Flex gap={4} alignItems="center">
              <Icon name="Coins" size={14} opacity={0.7} />
              <Text.Custom opacity={0.7} fontSize={2} fontWeight={400}>
                {space.token?.symbol}
              </Text.Custom>
            </Flex>
          )} */}
        </Flex>
      </Flex>
    </Flex>
  );
};

SpacePicture.defaultProps = {
  size: 32,
};
