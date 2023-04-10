import { ComponentStory, ComponentMeta } from '@storybook/react';
import styled from 'styled-components';
import { Text, Flex, Row } from '../../general';
import { Folder } from '.';

const SidebarList = styled(Flex)`
  gap: 2px;
  flex-direction: column;
  width: 300px;
`;

export default {
  component: Folder,
} as ComponentMeta<typeof Folder>;

export const Default: ComponentStory<typeof Folder> = () => (
  <SidebarList>
    <Folder label="Dev research">
      <Flex gap={2} flexDirection="column">
        <Row>Child 1</Row>
        <Row>Child 2</Row>
      </Flex>
    </Folder>
    <Folder
      label="Dev research"
      rightContent={<Text.Custom opacity={0.4}>Private</Text.Custom>}
    >
      <Row>Private Child 1</Row>
    </Folder>
  </SidebarList>
);

export const NestedFolders: ComponentStory<typeof Folder> = () => (
  <SidebarList>
    <Folder label="Dev research">
      <Row>Child 1</Row>
      <Row>Child 2</Row>
      <Folder label="React">
        <Row>Child 3</Row>
        <Row>Child 4</Row>
      </Folder>
      <Folder label="Hoon">
        <Row>Child 5</Row>
        <Row>Child 6</Row>
      </Folder>
    </Folder>
    <Folder
      label="Dev research"
      rightContent={<Text.Custom opacity={0.4}>Private</Text.Custom>}
    >
      <Row>Private Child 1</Row>
    </Folder>
  </SidebarList>
);

export const DeepNestedFolders: ComponentStory<typeof Folder> = () => (
  <SidebarList>
    <Folder label="Dev research">
      <Row>Child 1</Row>
      <Folder label="Hoon">
        <Row>Child 5</Row>
        <Row>Child 6</Row>
        <Folder label="Arvo">
          <Row>Child 7</Row>
          <Row>Child 8</Row>
          <Folder label="Gall">
            <Row>Child 9</Row>
            <Row>Child 10</Row>
          </Folder>
        </Folder>
      </Folder>
    </Folder>
    <Folder
      label="Dev research"
      rightContent={<Text.Custom opacity={0.4}>Private</Text.Custom>}
    >
      <Row>Private Child 1</Row>
    </Folder>
  </SidebarList>
);
