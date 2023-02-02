import { FC } from 'react';
import {
  TwitterTimelineEmbed,
  TwitterShareButton,
  TwitterFollowButton,
  TwitterHashtagButton,
  TwitterMentionButton,
  TwitterTweetEmbed,
  TwitterMomentShare,
  TwitterDMButton,
  TwitterVideoEmbed,
  TwitterOnAirButton,
} from 'react-twitter-embed';
import styled from 'styled-components';
import { Block, BlockProps } from '../Block/Block';

const TweetWrap = styled(Block)`
  min-height: 250px;
  > div {
    /* This is the wrapper of the embed */
    width: 100%;
  }
  .twitter-tweet {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
  }
`;

type TweetBlockProps = {
  link: string;
} & BlockProps;

export const TweetBlock: FC<TweetBlockProps> = (props: TweetBlockProps) => {
  const { id, link, ...rest } = props;
  let tweetEmbed: any = null;
  if (link.includes('status')) {
    const tweetId = link.split('status/')[1].split('?')[0];
    tweetEmbed = (
      <TwitterTweetEmbed
        tweetId={tweetId}
        options={{
          dnt: true,
          width: rest.width,
        }}
      />
    );
  } else {
    console.error('TweetBlock: link is not a tweet link');
  }

  return (
    <TweetWrap id={id} variant="content" {...rest}>
      {tweetEmbed}
      {/* <TweetWrap>{tweetEmbed}</TweetWrap> */}
    </TweetWrap>
  );
};
