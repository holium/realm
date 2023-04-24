import { Flex, Text } from '@holium/design-system';

type SettingTitleProps = {
  title: string;
  section?: string;
};
export const SettingTitle = ({ section, title }: SettingTitleProps) => {
  return (
    <Flex flexDirection="column">
      <Text.Custom fontSize={2} fontWeight={400} opacity={0.5}>
        {section}
      </Text.Custom>
      <Text.Custom fontSize={6} fontWeight={500}>
        {title}
      </Text.Custom>
    </Flex>
  );
};
