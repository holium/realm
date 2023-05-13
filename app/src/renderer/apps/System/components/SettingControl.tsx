import { Flex, Text } from '@holium/design-system';

type SettingControlProps = {
  label?: string;
  inline?: boolean;
  children: React.ReactNode;
};
export const SettingControl = ({
  label,
  inline = false,
  children,
}: SettingControlProps) => {
  return (
    <Flex
      flexDirection={inline ? 'row' : 'column'}
      gap={inline ? 16 : 0}
      {...(inline ? { alignItems: 'center' } : {})}
    >
      {label && (
        <Text.Custom
          display="inline-flex"
          alignItems="center"
          height="inherit"
          fontSize={2}
          fontWeight={500}
          opacity={0.8}
          mb={inline ? 0 : 2}
        >
          {label}
        </Text.Custom>
      )}
      <Flex flex={1}>{children}</Flex>
    </Flex>
  );
};
