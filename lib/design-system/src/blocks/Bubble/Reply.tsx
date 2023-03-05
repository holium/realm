import styled from 'styled-components';
import { Flex, BoxProps, capitalizeFirstLetter, Button, Icon } from '../..';
import { BubbleAuthor } from './Bubble.styles';
import {
  FragmentBlock,
  FragmentPlain,
  FragmentBlockquote,
  renderFragment,
} from './fragment-lib';
import { FragmentType, TEXT_TYPES } from './Bubble.types';

const ReplyContainer = styled(Flex)`
  flex-direction: column;
  justify-content: flex-end;
  blockquote {
    margin: 0px 0px;
  }
  width: 100%;
`;

export type ReplyProps = {
  id: string;
  author: string;
  authorColor?: string;
  sentAt: string;
  message?: FragmentType[];
  onClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel?: () => void;
} & BoxProps;

export const Reply = (props: ReplyProps) => {
  const {
    id,
    author,
    authorColor,
    message,
    onClick = () => {},
    onCancel,
  } = props;

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
    <ReplyContainer
      id={id}
      key={id}
      initial={{ opacity: 0, height: 25 }}
      animate={{ opacity: 1, height: 46 }}
      exit={{ opacity: 0, height: 25 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      <FragmentBlock
        id={id}
        style={{
          display: 'inline-flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          gap: 8,
        }}
      >
        <Icon name="Reply" size={22} color="accent" />
        <FragmentBlockquote
          id={id}
          style={{
            paddingTop: 6,
            paddingBottom: 6,
            borderRadius: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
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
          {onCancel && (
            <Button.IconButton
              onClick={(evt: React.MouseEvent<HTMLButtonElement>) => {
                evt.stopPropagation();
                onCancel();
              }}
            >
              <Icon name="Close" size={20} opacity={0.5} />
            </Button.IconButton>
          )}
        </FragmentBlockquote>
      </FragmentBlock>
    </ReplyContainer>
  );
};
