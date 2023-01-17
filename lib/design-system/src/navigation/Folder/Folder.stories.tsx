import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex, Row } from '../..';
import { Folder } from '.';

export default {
  component: Folder,
} as ComponentMeta<typeof Folder>;

export const Default: ComponentStory<typeof Folder> = () => (
  <Flex flexDirection="column" width={300}>
    <Folder label="Dev research">
      <Flex gap={2} flexDirection="column">
        <Row>Child 1</Row>
        <Row>Child 2</Row>
      </Flex>
    </Folder>
  </Flex>
);

export const NestedFolders: ComponentStory<typeof Folder> = () => (
  <Flex flexDirection="column" width={300}>
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
  </Flex>
);

export const DeepNestedFolders: ComponentStory<typeof Folder> = () => (
  <Flex flexDirection="column" width={300}>
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
  </Flex>
);
