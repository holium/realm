import { FC, useMemo, useState } from 'react';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import styled, { css } from 'styled-components';
import { skeletonStyle } from '../..';
import { BlockStyle, BlockProps } from '../Block/Block';

type TweetWrapperProps = { isSkeleton: boolean };

const TweetWrapper = styled(BlockStyle)<TweetWrapperProps>`
  min-height: 250px;
  > div {
    /* This is the wrapper of the embed */
    width: 100%;
  }
  .twitter-tweet {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
  }
  ${({ isSkeleton }: TweetWrapperProps) =>
    isSkeleton &&
    css`
      ${skeletonStyle}
      border-radius: 12px;
      min-width: 320px;
      height: calc(100% - 8px) !important;
      padding: 4px;
      min-height: 250px;
    `}
`;

type TweetBlockProps = {
  link: string;
  onTweetLoad?: () => void;
} & BlockProps;

export const TweetBlock: FC<TweetBlockProps> = (props: TweetBlockProps) => {
  const { id, link, onTweetLoad, ...rest } = props;
  let tweetEmbed: any = null;
  const [tweetLoaded, setTweetLoaded] = useState(false);
  // todo: get theme mode from context
  const themeMode = 'light';
  return useMemo(() => {
    if (link.includes('status')) {
      const tweetId = link.split('status/')[1].split('?')[0];
      tweetEmbed = (
        <TwitterTweetEmbed
          onLoad={() => {
            setTweetLoaded(true);
            onTweetLoad && onTweetLoad();
          }}
          tweetId={tweetId}
          options={{
            dnt: true,
            width: rest.width,
            theme: themeMode,
          }}
        />
      );
    } else {
      console.error('TweetBlock: link is not a tweet link');
    }

    return (
      <TweetWrapper isSkeleton={!tweetLoaded} id={id} {...rest}>
        {tweetEmbed}
      </TweetWrapper>
    );
  }, [link, tweetLoaded, themeMode]);
};
