import React, { useState } from 'react';

import { Button, Card, Flex, Icon, Menu, Text } from '@holium/design-system';

import { Sentences, TabPanel, Tabs, WordDefinitions } from '../components';
import { TabItem } from '../types';
import { displayDate } from '../utils';

const tabData: TabItem[] = [
  { label: 'Definitions', value: 0 },
  { label: 'Sentences', value: 1 },
];
interface Props {
  space: string | null;
  state: any;
  definitionList: any;
  sentenceList: any;
  votes: any;
  removeWord: any;
  goToDict: any;
}
export const Word = ({
  space,
  state,
  definitionList,
  sentenceList,
  votes,
  removeWord,
  goToDict,
}: Props) => {
  const [tabValue, setTabValue] = useState<number>(0);

  return (
    <Card flex={1} p={3} elevation={4} width={'100%'}>
      <Flex justifyContent={'space-between'} mb={'8px'}>
        <Text.H3 fontWeight={600}>{state.word}</Text.H3>

        <Flex alignItems="center" justifyContent={'center'} gap={4}>
          <Flex
            alignItems="center"
            justifyContent={'center'}
            gap={4}
            style={{
              padding: '4px 6px',
              backgroundColor: '#FDC14E1F',
              borderRadius: '6px',
            }}
          >
            <Icon
              name="StarFilled"
              size={14}
              iconColor="#FDC14E"
              style={{ marginTop: -2 }}
            />
            <Text.H6 fontWeight={400} style={{ color: '#FDC14E' }}>
              {votes?.upVotes ?? 0}
            </Text.H6>
          </Flex>

          <Menu
            orientation="bottom-left"
            id={`menu`}
            fontStyle={'normal'}
            dimensions={{ width: 200, height: 80 }}
            triggerEl={
              <Button.IconButton size={25}>
                <Icon name="MoreVertical" size={18} opacity={0.5} />
              </Button.IconButton>
            }
            options={[
              {
                id: `menu-element-2`,
                label: 'See dictionary definition',
                disabled: false,
                onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
                  evt.stopPropagation();
                  goToDict();
                },
              },
              {
                id: `menu-element-1`,
                label: 'Delete word',
                disabled: false,
                onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
                  evt.stopPropagation();
                  removeWord();
                },
              },
            ]}
          />
        </Flex>
      </Flex>
      <Flex justifyContent={'space-between'} mb={'16px'}>
        <Text.Body opacity={0.5} fontWeight={500}>
          {state.id?.split('/')[1]}
        </Text.Body>
        <Text.Body opacity={0.5} fontWeight={500}>
          {state.createdAt && displayDate(state.createdAt)}
        </Text.Body>
      </Flex>
      <Tabs
        value={tabValue}
        onChange={(newValue: number) => setTabValue(newValue)}
        tabData={tabData}
      />
      <TabPanel value={tabValue} index={0} other={null}>
        <Flex flexDirection={'column'} flex={1}>
          <WordDefinitions
            definitionList={definitionList}
            state={state}
            space={space}
          />
        </Flex>
      </TabPanel>
      <TabPanel value={tabValue} index={1} other={null}>
        <Flex flexDirection={'column'} flex={1}>
          <Sentences sentenceList={sentenceList} state={state} space={space} />
        </Flex>
      </TabPanel>
    </Card>
  );
};
