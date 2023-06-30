import { useState } from 'react';
import styled from 'styled-components';

import { Button, Crest, Flex, Icon, Text } from '../../../general';
import { Block, BlockProps } from '../Block/Block';

type SpaceBlockProps = {
  name: string;
  members: number;
  url: string;
  hasJoined: boolean;
  image?: string;
  onClick?: (path: string) => void;
} & BlockProps;

export const SpaceBlock = ({
  name,
  members,
  url,
  hasJoined,
  image,
  id,
  onClick,
  ...rest
}: SpaceBlockProps) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <Block id={id} {...rest}>
      <StyledSpaceWrapper id={id}>
        <Flex id={id} gap={8}>
          <Crest id={id} color="black" picture={image} size="sm2" />
          <Flex id={id} flexDirection="column" justifyContent="center">
            <Text.Custom
              id={id}
              fontWeight={500}
              fontSize={3}
              mb="2px"
              truncate
            >
              {name}
            </Text.Custom>
            {members > 0 ? (
              <Flex id={id} gap={4} alignItems={'center'}>
                <Icon id={id} name="Members" size={14} opacity={0.5} />
                <Text.Custom id={id} opacity={0.5} fontSize={2}>
                  {members} members
                </Text.Custom>
              </Flex>
            ) : (
              <Text.Custom id={id}>{url.split('/')[2]}</Text.Custom>
            )}
          </Flex>
        </Flex>
        <Button.Primary
          id={id}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            try {
              onClick && onClick(url);
            } catch (e) {
              setError((e as any).message as string);
            }
          }}
          height={30}
          isDisabled={hasJoined}
        >
          {hasJoined ? 'Joined' : 'Join'}
        </Button.Primary>
      </StyledSpaceWrapper>
      {error && (
        <Text.Hint id={id} style={{ color: 'red' }}>
          {error}
        </Text.Hint>
      )}
    </Block>
  );
};

const StyledSpaceWrapper = styled(Flex)`
  position: relative;
  height: 40px;
  width: 100%;
  min-width: 320px;
  background: rgba(var(--rlm-overlay-hover-color));
  border-radius: 4px;
  justify-content: space-between;
  align-items: center;
  padding-right: 4px;
  gap: 12px;
`;
