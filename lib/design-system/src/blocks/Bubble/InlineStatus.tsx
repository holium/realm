import { pluralize } from '../../../util';
import { Text, Flex, BoxProps, Icon } from '../../../general';
import { FragmentShip } from './fragment-lib';

type InlineStatusProps = {
  id: string;
  text: string;
  link?: string;
  buttons?: any[];
} & BoxProps;

const createdChatRegex = /created the chat/;
const joinedChatRegex = /joined the chat/;
const leftChatRegex = /left the chat/;
const parseCreatedJoinedLeftChat = (id: string, text: string) => {
  let patp: string = '';
  let status: string = '';
  if (createdChatRegex.test(text)) {
    status = 'created the chat';
    patp = text.replace(status, '').trim();
  } else if (joinedChatRegex.test(text)) {
    status = 'joined the chat';
    patp = text.replace(status, '').trim();
  } else if (leftChatRegex.test(text)) {
    status = 'left the chat';
    patp = text.replace(status, '').trim();
  }
  if (!patp) return null;
  return (
    <Flex id={id} flexDirection="row" alignItems="center" gap={4}>
      {/* TODO popup passport card on click */}
      <FragmentShip style={{ padding: '0px 4px' }} fontSize={1}>
        {patp}
      </FragmentShip>
      <Text.Custom id={id} fontSize={1} fontWeight={300} opacity={0.5}>
        {status}
      </Text.Custom>
    </Flex>
  );
};

const disappearingMessageRegex = /set disappearing messages to/;
const disappearingMessageOffRegex = /Messages now last forever/;
const dayRegex = /~d\d+/;
const hourRegex = /h\d+/;
const minRegex = /~m\d+/;
const parseDisappearingMessage = (id: string, text: string) => {
  if (disappearingMessageRegex.test(text)) {
    // check if the format is ~d30 or ~h24 or ~m30
    const days = text.match(dayRegex)?.[0].replace('~d', '');
    const hours = text.match(hourRegex)?.[0].replace('~h', '');
    const minutes = text.match(minRegex)?.[0].replace('~m', '');
    let timeString = '';
    if (days) {
      timeString = `${days} ${pluralize('day', parseInt(days))}`;
    }
    if (hours) {
      timeString = `${hours} ${pluralize('hour', parseInt(hours))}`;
    }
    if (minutes) {
      timeString = `${minutes} ${pluralize('minute', parseInt(minutes))}`;
    }

    return (
      <Flex id={id} flexDirection="row" gap={4} alignItems="center">
        <Icon
          style={{ pointerEvents: 'none' }}
          name="ClockSlash"
          size={16}
          opacity={0.5}
        />
        <Text.Custom id={id} fontSize={1} fontWeight={300} opacity={0.5}>
          Disappearing messages set to {timeString}
        </Text.Custom>
      </Flex>
    );
  } else if (disappearingMessageOffRegex.test(text)) {
    return (
      <Flex id={id} flexDirection="row" gap={4} alignItems="center">
        <Icon
          style={{ pointerEvents: 'none' }}
          name="Clock"
          size={15} // 16 is too big compared to the slash icon
          opacity={0.5}
        />
        <Text.Custom id={id} fontSize={1} fontWeight={300} opacity={0.5}>
          Messages now last forever
        </Text.Custom>
      </Flex>
    );
  }
  return null;
};

export const InlineStatus = ({ id, text }: InlineStatusProps) => {
  let innerContent = (
    <Text.Custom id={id} fontSize={1} fontWeight={300} opacity={0.5}>
      {text}
    </Text.Custom>
  );

  innerContent = parseDisappearingMessage(id, text) || innerContent;
  innerContent = parseCreatedJoinedLeftChat(id, text) || innerContent;

  return (
    <Flex
      width="100%"
      pt={1}
      pb={1}
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
    >
      {innerContent}
    </Flex>
  );
};

// TODO regex parser for wallet txn
// const walletStatusRegex = /%realm-wallet/;
// export function shortenedTxn(address: string) {
//   return `${address.slice(0, 6)}...${address.slice(-4)}`;
// }
// const parseWalletTxn = (text: string) => {
//   if (walletStatusRegex.test(text)) {
//     // extra all the data from the text between the brackets
//     // %realm-wallet [from=~novdus-fidlys-dozzod-hostyv] [to=~sicnum-rocwen] [tx=0x3230549cfc72c1a9e674f8a296ba94c1dea3845928e0f02f0295f6631a5aa9ec] [link=https://goerli.etherscan.io/tx/0x3230549cfc72c1a9e674f8a296ba94c1dea3845928e0f02f0295f6631a5aa9ec]
//     const from = text.match(/\[from=~[a-z0-9-]+\]/)?.[0].slice(6, -1);
//     const to = text.match(/\[to=~[a-z0-9-]+\]/)?.[0].slice(4, -1);
//     const tx = text.match(/\[tx=0x[a-z0-9]+\]/)?.[0].slice(4, -1);
//     const link = text
//       .match(/\[link=https:\/\/[a-z0-9.\/]+\]/)?.[0]
//       .slice(6, -1);
//     innerContent = (
//       <Flex flexDirection="row" gap={8}>
//         <Icon name="WalletNew" size={16} mr={2} opacity={0.5} />

//         <Text.Custom fontSize={1} fontWeight={300} opacity={0.5}>
//           New txn {from} to {to} in {shortenedTxn(tx?.toString())}{' '}
//         </Text.Custom>
//         <Icon
//           name="Link"
//           size={16}
//           mr={2}
//           opacity={0.5}
//           onClick={() => {
//             link && window.open(link.toString(), '_blank');
//           }}
//         />
//       </Flex>
//     );
//   }
// }
