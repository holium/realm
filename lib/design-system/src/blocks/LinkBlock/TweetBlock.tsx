import { FC, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import styled, { css } from 'styled-components';
import { skeletonStyle } from '../../general';
import { BlockStyle, BlockProps } from '../Block/Block';

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
        // webview.openDevTools();
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
      // console.log('tweetId', tweetId, 'width', tWidth, 'height', height);

      tweetEmbed = (
        <webview
          id={`${id}-webview`}
          webpreferences="sandbox=false"
          preload={`javaScript:const ipcRenderer = require('electron');
              document.addEventListener('DOMContentLoaded', () => {
                ipc.sendToHost({
                  height: document.querySelector('article').offsetHeight,
                });
              });
            `}
          src={`https://platform.twitter.com/embed/Tweet.html?dnt=true&embedId=twitter-widget-0a&frame=false&hideCard=false&hideThread=false&id=${tweetId}&lang=en&theme=light&widgetsVersion=aaf4084522e3a%3A1674595607486&width=${tWidth}px`}
          style={{
            // left: 0,
            // top: 0,
            // bottom: 0,
            // right: 0,
            // position: 'absolute',
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

  console.log('tray', tray.offsetHeight, tray.offsetWidth);

  return new Promise((resolve, reject) => {
    root.render(
      <TweetBlock
        id="premeasure-tweet"
        variant="content"
        link={src}
        width={320}
        height={700}
        onTweetLoad={() => {
          const webview: HTMLWebViewElement | null = document.getElementById(
            'premeasure-tweet-webview'
          );
          if (webview) {
            console.log('webview loaded', webview);
            webview.addEventListener('ipc-message', (event) => {
              console.log(event);
              // Prints "pong"
            });
            // webview.openDevTools();

            webview
              // @ts-ignore
              .executeJavaScript(
                'document.querySelector("article").offsetHeight'
              )
              .then((height: number) => {
                console.log('tweet height', height);
                // const height = Math.ceil(div.offsetHeight);
                const width = Math.ceil(div.offsetWidth);
                // webview.webContents.
                console.log(
                  'tweet measure',
                  width,
                  height,
                  webview?.style.height
                );
                tray.removeChild(div);
                resolve({ width: `${width}`, height: `${height}` });
              })
              .catch((e) => {
                console.error('tweet measure error', e);
                tray.removeChild(div);
                reject();
              });
          }
        }}
      />
    );
  });
};
