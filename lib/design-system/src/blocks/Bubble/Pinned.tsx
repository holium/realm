import { Flex, BoxProps, capitalizeFirstLetter } from '../..';
import { BubbleAuthor } from './Bubble.styles';
import {
  FragmentBlock,
  FragmentPlain,
  FragmentBlockquote,
  renderFragment,
} from './fragment-lib';
import { FragmentType, TEXT_TYPES } from './Bubble.types';
// import { chatDate } from '../../util/date';

export type PinnedProps = {
  id: string;
  author: string;
  authorColor?: string;
  sentAt: string;
  message?: FragmentType[];
  onClick?: (msgId: string) => void;
} & BoxProps;

export const PinnedMessage = (props: PinnedProps) => {
  const { id, author, authorColor, message, onClick = () => {} } = props;

  if (!message) return null;
  const fragmentType: string = Object.keys(message[0])[0];
  let pinnedContent = null;
  if (
    !TEXT_TYPES.includes(fragmentType) &&
    fragmentType !== 'image' &&
    fragmentType !== 'reply'
  ) {
    pinnedContent = (
      <FragmentPlain id={id}>
        {capitalizeFirstLetter(fragmentType)}
      </FragmentPlain>
    );
  } else {
    pinnedContent = renderFragment(id, message[0], 0, author);
  }

  return (
    <Flex id={id} key={id} mx="1px" width="100%" onClick={onClick}>
      <FragmentBlock id={id}>
        <FragmentBlockquote
          id={id}
          style={{
            paddingTop: 6,
            paddingBottom: 6,
            borderRadius: 4,
            borderLeft: `2px solid ${authorColor || 'var(--rlm-accent-color)'}`,
            background: 'var(--rlm-overlay-hover)',
          }}
        >
          <Flex flexDirection="column" className="fragment-reply">
            <BubbleAuthor id={id} authorColor={authorColor}>
              {author}
            </BubbleAuthor>
            {pinnedContent}
          </Flex>
        </FragmentBlockquote>
      </FragmentBlock>
    </Flex>
  );
};