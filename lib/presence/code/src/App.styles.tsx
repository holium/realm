import styled from 'styled-components';
import { Flex } from '@holium/design-system';

export const Header = styled(Flex)`
  width: 100%;
  padding: 16px;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  * {
    color: #8b949e;
  }
`;

export const EditorContainer = styled(Flex)`
  flex: 1;
  flex-direction: column;
  width: 100%;
  color: #c8d1d9;
  border: 1px solid #30363c;
  background-color: #0e1117;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas,
    Liberation Mono, monospace;
  font-size: 12px;
  overflow-y: auto;
  counter-reset: line-counter;
  .ProseMirror {
    outline: none;
    line-height: 1.5em;
  }
  p::before {
    counter-increment: line-counter;
    content: counter(line-counter);
    display: inline-block;
    width: 60px;
    text-align: center;
    color: #8b949e;
    border-right: 1px solid #30363c;
  }
  .current-element {
    background-color: rgba(48, 54, 60, 0.5);
    &::before {
      color: #fff;
    }
  }
`;
