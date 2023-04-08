import { Ref } from 'react';
import styled from 'styled-components';
import { Virtuoso, VirtuosoProps, VirtuosoHandle } from 'react-virtuoso';

const Container = styled.div<{ hideScrollbar?: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;

  > :nth-child(1) {
    overflow-x: hidden;
    overflow-y: scroll !important;

    /* custom scrollbar */
    ::-webkit-scrollbar {
      width: 12px;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 20px;
      border: 3px solid transparent;
      background-clip: content-box;
      background-color: transparent;
    }

    ::-webkit-scrollbar-track {
      border-radius: 20px;
      border: 3px solid transparent;
      background-clip: content-box;
      background-color: transparent;
    }
  }

  // On hover, show the scrollbar, unless hideScrollbar is true.
  &:hover {
    > :nth-child(1) {
      ::-webkit-scrollbar-thumb {
        background-color: rgba(var(--rlm-text-rgba), 0.3);
      }

      ::-webkit-scrollbar-thumb:hover {
        background-color: rgba(var(--rlm-text-rgba), 0.6);
      }

      ::-webkit-scrollbar-track:hover {
        background-color: rgba(var(--rlm-input-rgba), 0.3);
      }
    }
  }
`;

export type WindowedListRef = VirtuosoHandle;

type Props<ItemData = any, Context = any> = VirtuosoProps<ItemData, Context> & {
  innerRef?: Ref<WindowedListRef>;
  hideScrollbar?: boolean;
};

export const WindowedList = <ItemData, Context = any>({
  innerRef,
  width = '100%',
  height = '100%',
  hideScrollbar = false,
  style,
  ...props
}: Props<ItemData, Context>) => (
  <Container hideScrollbar={hideScrollbar}>
    <Virtuoso
      ref={innerRef}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  </Container>
);
