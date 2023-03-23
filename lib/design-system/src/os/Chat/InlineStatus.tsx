import { Text, Flex, BoxProps } from '../../';

type InlineStatusProps = {
  // icon?: IconPathsType;
  text: string;
  link?: string;
  buttons?: any[];
} & BoxProps;

// const createdChatRegex = /created the chat/;
// const joinedChatRegex = /joined the chat/;

export const InlineStatus = ({ text }: InlineStatusProps) => {
  // if (createdChatRegex.test(props.text)) {
  //   return;
  // }

  return (
    <Flex
      width="100%"
      pt={0}
      pb={2}
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
    >
      {/* {icon && <Icon name={icon} size={16} mr={2} opacity={0.5} />} */}
      <Text.Custom fontSize={1} fontWeight={300} opacity={0.5}>
        {text}
      </Text.Custom>
    </Flex>
  );
};
