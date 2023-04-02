import { Text, Flex, BoxProps } from '../../general';

type InlineStatusProps = {
  // icon?: IconPathsType;
  text: string;
  link?: string;
  buttons?: any[];
} & BoxProps;

// const createdChatRegex = /created the chat/;
// const joinedChatRegex = /joined the chat/;
// const walletStatusRegex = /%realm-wallet/;

export function shortenedTxn(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const InlineStatus = ({ text }: InlineStatusProps) => {
  let innerContent = (
    <Text.Custom fontSize={1} fontWeight={300} opacity={0.5}>
      {text}
    </Text.Custom>
  );
  // if (walletStatusRegex.test(text)) {
  //   // extra all the data from the text between the brackets
  //   // %realm-wallet [from=~novdus-fidlys-dozzod-hostyv] [to=~sicnum-rocwen] [tx=0x3230549cfc72c1a9e674f8a296ba94c1dea3845928e0f02f0295f6631a5aa9ec] [link=https://goerli.etherscan.io/tx/0x3230549cfc72c1a9e674f8a296ba94c1dea3845928e0f02f0295f6631a5aa9ec]
  //   const from = text.match(/\[from=~[a-z0-9-]+\]/)?.[0].slice(6, -1);
  //   const to = text.match(/\[to=~[a-z0-9-]+\]/)?.[0].slice(4, -1);
  //   const tx = text.match(/\[tx=0x[a-z0-9]+\]/)?.[0].slice(4, -1);
  //   const link = text
  //     .match(/\[link=https:\/\/[a-z0-9.\/]+\]/)?.[0]
  //     .slice(6, -1);
  //   innerContent = (
  //     <Flex flexDirection="row" gap={8}>
  //       <Icon name="WalletNew" size={16} mr={2} opacity={0.5} />

  //       <Text.Custom fontSize={1} fontWeight={300} opacity={0.5}>
  //         New txn {from} to {to} in {shortenedTxn(tx?.toString())}{' '}
  //       </Text.Custom>
  //       <Icon
  //         name="Link"
  //         size={16}
  //         mr={2}
  //         opacity={0.5}
  //         onClick={() => {
  //           link && window.open(link.toString(), '_blank');
  //         }}
  //       />
  //     </Flex>
  //   );
  // }

  return (
    <Flex
      width="100%"
      pt={1}
      pb={1}
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
    >
      {/* {icon && <Icon name={icon} size={16} mr={2} opacity={0.5} />} */}
      {innerContent}
    </Flex>
  );
};
