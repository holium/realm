import { useState } from 'react';
import styled from 'styled-components';

import { Button, Flex, Icon, Text } from '../../../general';
import { Block, BlockProps } from '../Block/Block';
import { ImageBlock } from '../ImageBlock/ImageBlock';

type SpaceBlockProps = {
  name: string;
  members: number;
  url: string;
  image?: string;
  onClick?: (path: string) => void;
} & BlockProps;

export const SpaceBlock = ({
  name,
  members,
  url,
  image,
  id,
  onClick,
  ...rest
}: SpaceBlockProps) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <Block id={id} {...rest}>
      <StyledSpaceWrapper id={id}>
        <Flex id={id}>
          <ImageBlock
            id={id}
            by=""
            showLoader={true}
            image={image || ''}
            width={40}
            height={40}
            mr={2}
          />
          <div id={id}>
            <Text.Custom id={id} fontWeight={700} pb={1}>
              {name}
            </Text.Custom>
            {members > 0 ? (
              <Flex id={id}>
                <Icon id={id} name="Members" size={14} opacity={0.5} />
                <Text.Custom id={id}>{members} members</Text.Custom>
              </Flex>
            ) : (
              <Text.Custom id={id}>{url.split('/')[0]}</Text.Custom>
            )}
          </div>
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
          mt={1}
        >
          Join
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
  min-width: 250px;
  background: rgba(var(--rlm-overlay-hover-color));
  border-radius: 4px;
  justify-content: space-between;
`;
