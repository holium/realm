import { FC } from 'react';
import { Box, BoxProps, Flex, FlexProps } from '@holium/design-system';
import { transparentize } from 'polished';
import styled from 'styled-components';

interface PasscodeDisplayProps {
  digits: number;
  filled: number;
}

const FilledFlex = styled(Flex)<FlexProps>`
  border: 2px solid rgba(var(--rlm-accent-rgba));
`;

const FilledBox = styled(Box)<BoxProps>`
  background-color: rgba(var(--rlm-accent-rgba));
`;

export const PasscodeDisplay: FC<PasscodeDisplayProps> = (
  props: PasscodeDisplayProps
) => {
  const Filled = () => (
    <FilledFlex
      mx="6px"
      height={35}
      width={32}
      borderRadius={4}
      alignItems="center"
      justifyContent="center"
    >
      <FilledBox height="8px" width="8px" borderRadius="50%"></FilledBox>
    </FilledFlex>
  );

  const Empty = (props: any) => (
    <Flex
      mx="6px"
      height={35}
      width={32}
      border={props.border}
      borderRadius={4}
      background={props.background}
    ></Flex>
  );

  return (
    <Flex width="100%" alignItems="center" justifyContent="center">
      {[...Array(props.digits).keys()].map((index) => {
        return index < props.filled ? (
          <Filled key={index} />
        ) : (
          <Empty
            key={index}
            border={`2px solid ${transparentize(0.9, '#000000')}`}
          />
        );
      })}
    </Flex>
  );
};
