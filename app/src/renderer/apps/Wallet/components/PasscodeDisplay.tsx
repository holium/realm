import { FC } from 'react';
import { Flex, Box } from 'renderer/components';
import { darken, transparentize } from 'polished';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from '../lib/helpers';

interface PasscodeDisplayProps {
  digits: number;
  filled: number;
}

export const PasscodeDisplay: FC<PasscodeDisplayProps> = (
  props: PasscodeDisplayProps
) => {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);

  let Filled = () => (
    <Flex
      mx="6px"
      height={35}
      width={32}
      border={`solid 1px ${baseTheme.colors.brand.primary}`}
      alignItems="center"
      justifyContent="center"
    >
      <Box
        height="8px"
        width="8px"
        backgroundColor={baseTheme.colors.text.primary}
        borderRadius="50%"
      ></Box>
    </Flex>
  );

  let Empty = (props: any) => (
    <Flex
      mx="6px"
      height={35}
      width={32}
      border={props.border}
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
            background={darken(0.02, theme.currentTheme!.windowColor)}
          />
        );
      })}
    </Flex>
  );
};
