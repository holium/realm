import { FC } from 'react';
import { Flex, Box } from '@holium/design-system';
import { transparentize } from 'polished';

interface PasscodeDisplayProps {
  digits: number;
  filled: number;
}

export const PasscodeDisplay: FC<PasscodeDisplayProps> = (
  props: PasscodeDisplayProps
) => {
  const Filled = () => (
    <Flex
      mx="6px"
      height={35}
      width={32}
      borderRadius={4}
      alignItems="center"
      justifyContent="center"
    >
      <Box height="8px" width="8px" borderRadius="50%"></Box>
    </Flex>
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
