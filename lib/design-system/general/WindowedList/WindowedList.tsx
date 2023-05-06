import { Ref } from 'react';
import { Virtuoso, VirtuosoHandle, VirtuosoProps } from 'react-virtuoso';
import styled from 'styled-components';

const SCROLLBAR_WIDTH = 12;

const Container = styled.div<{
  hideScrollbar?: boolean;
}>`
  position: relative;
  width: 100%;
  height: 100%;

  > :nth-child(1) {
    overflow-x: hidden;
    overflow-y: scroll !important;

    /* custom scrollbar */
    ::-webkit-scrollbar {
      width: ${SCROLLBAR_WIDTH}px;
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
  width?: number;
  height?: number;
  data: ItemData[];
  innerRef?: Ref<WindowedListRef>;
  chatMode?: boolean;
  shiftScrollbar?: boolean;
  hideScrollbar?: boolean;
};

export const WindowedList = <ItemData, Context = any>({
  data,
  innerRef,
  width,
  height,
  chatMode = false,
  shiftScrollbar = false,
  hideScrollbar = false,
  style,
  ...props
}: Props<ItemData, Context>) => (
  <Container hideScrollbar={hideScrollbar}>
    <Virtuoso
      ref={innerRef}
      data={data}
      followOutput={chatMode}
      initialTopMostItemIndex={chatMode ? data.length - 1 : 0}
      style={{
        width: width ? width + (shiftScrollbar ? SCROLLBAR_WIDTH : 0) : '100%',
        height: height ?? '100%',
        marginRight: -(shiftScrollbar ? SCROLLBAR_WIDTH : 0),
        ...style,
      }}
      {...props}
    />
  </Container>
);
