import { FC } from 'react';
import styled, { css } from 'styled-components';
import { Flex, Icons, Text, Crest } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { pluralize } from 'renderer/logic/lib/text';

interface SpacePictureProps {
  space: SpaceModelType;
  size?: number;
  membersCount?: number;
  textColor: string;
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

const Picture = styled.img<PictureProps>`
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
  const { space, size, membersCount, textColor } = props;

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
        <EmptyPicture size={size} color={space.color || '#000000'} />
      )}
      <Flex
        flexDirection="column"
        justifyContent="center"
        gap={4}
        {...FadeInMotion}
      >
        {/* Title column */}
        <Text
          initial={{ color: textColor }}
          animate={{ color: textColor }}
          transition={{ color: { duration: 0.5 } }}
          fontSize={4}
          fontWeight={500}
        >
          {space.name}
        </Text>
        <Flex gap={10} alignItems="center">
          {/* Subtitle row */}
          <Flex gap={4} alignItems="center">
            {/* Member count */}
            <Icons
              name="Members"
              size="14px"
              initial={{ fill: textColor }}
              animate={{ fill: textColor }}
              transition={{ fill: { duration: 0.5 } }}
              opacity={0.7}
            />
            <Text
              initial={{ color: textColor }}
              animate={{ color: textColor }}
              transition={{ color: { duration: 0.5 } }}
              opacity={0.7}
              fontSize={2}
              fontWeight={400}
            >
              {membersCount} {membersCount && pluralize('member', membersCount)}
            </Text>
          </Flex>
          {space.token && (
            <Flex gap={4} alignItems="center">
              {/* Token info */}
              <Icons name="Coins" size="14px" fill={textColor} opacity={0.7} />
              <Text
                initial={{ color: textColor }}
                animate={{ color: textColor }}
                transition={{ color: { duration: 0.5 } }}
                opacity={0.7}
                fontSize={2}
                fontWeight={400}
              >
                {space.token?.symbol}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

SpacePicture.defaultProps = {
  size: 32,
};
