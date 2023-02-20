import { Flex, Button, Text, Icon, Menu } from '@holium/design-system';

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
    <Flex
      pt="2px"
      pr="2px"
      pb={12}
      gap={12}
      height={40}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Flex
        gap={8}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
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
            truncate
            width={255}
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
      <Flex>
        <Menu
          id={`chat-${path}-menu`}
          orientation="bottom-left"
          offset={{ x: 0, y: 2 }}
          triggerEl={
            <Button.IconButton size={26}>
              <Icon name="MoreHorizontal" size={22} opacity={0.5} />
            </Button.IconButton>
          }
          options={[
            {
              id: 'edit-chat',
              icon: 'Edit',
              label: 'Edit',
              disabled: false,
              onClick: () => console.log('Option 2 clicked'),
            },
            {
              id: 'chat-info',
              icon: 'Info',
              label: 'Info',
              disabled: false,
              onClick: () => console.log('Option 2 clicked'),
            },
            {
              id: 'mute-chat',
              icon: 'NotificationOff',
              label: 'Mute',
              disabled: false,
              onClick: () => console.log('Option 2 clicked'),
            },
            {
              id: 'add-person',
              icon: 'UserAdd',
              label: 'Add person',
              disabled: false,
              onClick: () => console.log('Option 1 clicked'),
            },
          ]}
        ></Menu>
      </Flex>
    </Flex>
  );
};
