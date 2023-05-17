import { Box, Flex } from '@holium/design-system/general';

const FilledNumber = () => (
  <Flex
    width={32}
    height={35}
    borderRadius={4}
    alignItems="center"
    justifyContent="center"
    border="2px solid rgba(var(--rlm-accent-rgba))"
  >
    <Box
      height="8px"
      width="8px"
      borderRadius="50%"
      background="rgba(var(--rlm-accent-rgba))"
    />
  </Flex>
);

const EmptyNumber = () => (
  <Flex
    width={32}
    height={35}
    borderRadius={4}
    border="2px solid rgba(var(--rlm-text-rgba), 0.1)"
    background="rgba(var(--rlm-text-rgba), 0.02)"
  />
);

type Props = {
  digits: number;
  filled: number;
};

export const PasscodeDisplay = ({ digits, filled }: Props) => (
  <Flex width="100%" alignItems="center" justifyContent="center" gap="11px">
    {[...Array(digits).keys()].map((index) => {
      if (index < filled) {
        return <FilledNumber key={index} />;
      }

      return <EmptyNumber key={index} />;
    })}
  </Flex>
);
