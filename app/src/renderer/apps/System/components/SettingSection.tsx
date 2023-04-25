import { Flex, Text, Card } from '@holium/design-system';

type SettingSectionProps = {
  title?: string;
  children: React.ReactNode;
};
export const SettingSection = ({ title, children }: SettingSectionProps) => {
  return (
    <Flex flexDirection="column" mb={2}>
      {title && (
        <Text.Custom
          fontSize={2}
          textTransform="uppercase"
          fontWeight={500}
          opacity={0.4}
          mb={2}
          ml="2px"
        >
          {title}
        </Text.Custom>
      )}
      <Card p={3} elevation={1}>
        <Flex flexDirection="column" gap={16}>
          {children}
        </Flex>
      </Card>
    </Flex>
  );
};
