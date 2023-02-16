import { Flex, Button, Text, Icon } from '@holium/design-system';

type ChatLogHeaderProps = {
  path: string;
  title: string;
  subtitle?: string;
  avatar: React.ReactNode;
  onBack: () => void;
};

export const ChatLogHeader = ({
  path,
  title,
  subtitle,
  avatar,
  onBack,
}: ChatLogHeaderProps) => {
  return (
    <Flex height={40} pb={12} flexDirection="row" gap={12} alignItems="center">
      <Button.IconButton
        size={26}
        onClick={(evt) => {
          evt.stopPropagation();
          onBack();
        }}
      >
        <Icon name="ArrowLeftLine" size={22} opacity={0.5} />
      </Button.IconButton>
      <Flex
        layoutId={`chat-${path}-avatar`}
        layout="position"
        transition={{
          duration: 0.1,
        }}
      >
        {avatar}
      </Flex>
      <Flex alignItems="flex-start" flexDirection="column">
        <Text.Custom
          layoutId={`chat-${path}-name`}
          layout="position"
          transition={{
            duration: 0.1,
          }}
          fontWeight={500}
          fontSize={3}
        >
          {title}
        </Text.Custom>
        {subtitle && (
          <Text.Custom
            transition={{
              delay: 0.1,
              duration: 0.1,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            opacity={0.5}
            fontSize={2}
          >
            {subtitle}
          </Text.Custom>
        )}
      </Flex>
    </Flex>
  );
};
