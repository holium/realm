import React, { useState } from 'react';
import {
  Button,
  Icon,
  Card,
  Flex,
  Text,
  TextInput,
  Menu,
} from '@holium/design-system';
import { Tabs, TabPanel } from '../components';
import { TabItem } from '../types';

const tabData: TabItem[] = [
  { label: 'Definitions', value: 0 },
  { label: 'Sentences', value: 1 },
];
function Word() {
  const [tabValue, setTabValue] = useState<number>(0);
  return (
    <Card p={3} elevation={4} maxWidth={400}>
      <Text.Label opacity={0.7} fontWeight={400} style={{ marginBottom: 4 }}>
        Word of the day
      </Text.Label>
      <Flex justifyContent={'space-between'} mb={'8px'}>
        <Text.H3 fontWeight={600}>Based</Text.H3>

        <Flex alignItems="center" justifyContent={'center'} gap={4}>
          <Flex
            alignItems="center"
            justifyContent={'center'}
            gap={4}
            style={{
              padding: '4px 3px',
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
              50
            </Text.H6>
          </Flex>

          <Menu
            orientation="bottom-left"
            id={`menu`}
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
                },
              },
              {
                id: `menu-element-1`,
                label: 'Delete word',
                disabled: false,
                onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
                  evt.stopPropagation();
                },
              },
            ]}
          />
        </Flex>
      </Flex>
      <Flex justifyContent={'space-between'} mb={'16px'}>
        <Text.Body opacity={0.5}>~lodlev-migdev</Text.Body>
        <Text.Body opacity={0.5}>07/21/2022 10:30 AM</Text.Body>
      </Flex>
      <Tabs
        value={tabValue}
        onChange={(newValue: number) => setTabValue(newValue)}
        tabData={tabData}
      />
      <TabPanel value={tabValue} index={0}>
        <Definitions />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Definitions />
      </TabPanel>
      <Flex flexDirection={'column'} gap={10}>
        <TextInput
          id="definition-input"
          name="definition"
          style={{
            marginTop: 30,
            borderRadius: 6,
            paddingLeft: 9,
          }}
          value={''}
          placeholder="Add a new definition..."
          error={false}
          onChange={() => null}
        />
        <Button.TextButton fontSize={1} fontWeight={600} alignSelf={'flex-end'}>
          Submit
        </Button.TextButton>
      </Flex>
    </Card>
  );
}

function Definition({ text }: { text: string }) {
  return (
    <Flex flexDirection={'column'} gap={8}>
      <Text.Body>{text}</Text.Body>
      <Flex justifyContent={'space-between'}>
        <Flex gap={10}>
          <Button.IconButton>
            <Icon
              name="ThumbsUp"
              size={20}
              style={{ marginTop: 3, marginRight: -5 }}
              opacity={0.7}
            />

            <Text.Body opacity={0.7}>23</Text.Body>
          </Button.IconButton>
          <Button.IconButton>
            <Icon
              name="ThumbsDown"
              size={20}
              style={{ marginBottom: -7, marginRight: -5 }}
              opacity={0.7}
            />

            <Text.Body opacity={0.7}>2</Text.Body>
          </Button.IconButton>
        </Flex>
        <Text.Body opacity={0.5}> ~lodlev-migdev</Text.Body>
      </Flex>
    </Flex>
  );
}
function Definitions() {
  return (
    <Flex flexDirection="column" gap={20}>
      <Definition
        text={
          'A word used when you agree with something; or when you want to recognize someone for being themselves.'
        }
      />
      <Definition text={'Opposite of cringe'} />
      <Definition text={'based on a true story'} />
      <Definition text={'popular word among internet users'} />
    </Flex>
  );
}

export default Word;
