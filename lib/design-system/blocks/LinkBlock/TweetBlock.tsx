import { FC, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import styled, { css } from 'styled-components';

import { skeletonStyle } from '../../general';
import { BlockProps, BlockStyle } from '../Block/Block';

type TweetWrapperProps = { isSkeleton?: boolean };

const TweetWrapper = styled(BlockStyle)<TweetWrapperProps>`
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
      /* height: calc(100% - 8px) !important; */
      padding: 4px;
    `}
`;

type TweetBlockProps = {
  link: string;
  width: number;
  height?: number;
  onTweetLoad?: () => void;
} & BlockProps;

export const TweetBlock: FC<TweetBlockProps> = (props: TweetBlockProps) => {
  const { id, link, width, height, onTweetLoad, ...rest } = props;
  let tweetEmbed: any = null;
  // todo: get theme mode from context
  const themeMode = 'light';
  useEffect(() => {
    const webview: HTMLWebViewElement | null = document.getElementById(
      `${id}-webview`
    );
    if (webview) {
      webview.addEventListener('dom-ready', () => {
        onTweetLoad && onTweetLoad();
      });
    }
    return () => {
      if (webview) {
        webview.removeEventListener('dom-ready', () => {
          onTweetLoad && onTweetLoad();
        });
      }
    };
  }, [link]);

  return useMemo(() => {
    if (link.includes('status')) {
      const tweetId = link.split('status/')[1].split('?')[0];
      const tWidth = width;
      tweetEmbed = (
        <webview
          id={`${id}-webview`}
          webpreferences="sandbox=false"
          src={`https://platform.twitter.com/embed/Tweet.html?dnt=true&embedId=twitter-widget-0a&frame=false&hideCard=false&hideThread=false&id=${tweetId}&lang=en&theme=light&widgetsVersion=aaf4084522e3a%3A1674595607486&width=${tWidth}px`}
          style={{
            borderRadius: '4px',
            overflow: 'hidden',
            width: tWidth,
            height: height,
          }}
        />
      );
    } else {
      console.error('TweetBlock: link is not a tweet link');
    }

    return (
      <TweetWrapper id={id} {...rest}>
        {tweetEmbed}
      </TweetWrapper>
    );
  }, [link, themeMode]);
};

export const measureTweet = (
  src: string,
  _containerWidth?: number
): Promise<{ width: string; height: string }> => {
  const div = document.createElement('div');
  const tray = document.getElementById('messages-tray-app');
  if (!tray) {
    return new Promise((resolve) => resolve({ width: '0px', height: '0px' }));
  }
  div.style.visibility = 'hidden';
  div.style.position = 'absolute';
  div.style.top = '-1000px';
  div.style.left = '-1000px';
  div.style.width = `${320}px`;
  div.style.padding = '8px';
  div.style.boxSizing = 'border-box';
  div.style.minWidth = '150px';
  div.style.height = '700px';
  tray.appendChild(div);
  const root = createRoot(div);

  return new Promise((resolve) => {
    root.render(
      <TweetBlock
        id="premeasure-tweet"
        variant="content"
        link={src}
        width={320}
        height={340}
        onTweetLoad={() => {
          const webview: HTMLWebViewElement | null = document.getElementById(
            'premeasure-tweet-webview'
          );
          if (webview) {
            const height = Math.ceil(webview.offsetHeight);
            const width = Math.ceil(webview.offsetWidth);
            tray.removeChild(div);
            resolve({ width: `${width}`, height: `${height}` });
          } else {
            resolve({ width: '0px', height: '0px' });
          }
        }}
      />
    );
  });
};
