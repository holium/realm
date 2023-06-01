import { useState } from 'react';
import {
  Button,
  Icon,
  Card,
  Flex,
  Text,
  Input,
  TextInput,
  Tab,
} from '@holium/design-system';

function App() {
  return (
    <Flex alignItems={'center'} flexDirection={'column'}>
      <Flex flex={1} gap={10} justifyContent={'center'} marginBottom={25}>
        <TextInput
          id="search-input"
          name="search"
          required
          leftAdornment={<Icon name="Search" size={16} opacity={0.7} />}
          style={{
            borderRadius: 6,
            paddingLeft: 9,
          }}
          value={''}
          placeholder="Search words"
          error={false}
          onChange={() => null}
        />
        <Button.TextButton
          fontSize={1}
          fontWeight={600}
          //onClick={onUpload}
        >
          Add Word
        </Button.TextButton>
      </Flex>

      <Card p={3} elevation={4} bg="text" color="base" maxWidth={400}>
        <Text.Label opacity={0.7} fontWeight={400} style={{ marginBottom: 4 }}>
          Word of the day
        </Text.Label>
        <Flex justifyContent={'space-between'} mb={16}>
          <Text.H3 fontWeight={600}>Based</Text.H3>
          <Flex
            flexDirection={'row'}
            alignItems="center"
            justifyContent={'center'}
            style={{
              padding: '4px 3px',
              backgroundColor: '#FDC14E1F',
              borderRadius: '6px',
            }}
            gap={4}
          >
            <Icon name="StarFilled" size={14} iconColor="#FDC14E" />
            <Text.H6 fontWeight={400} style={{ color: '#FDC14E' }}>
              50
            </Text.H6>
          </Flex>
        </Flex>
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
      </Card>
    </Flex>
  );
}
function Definition({ text }: { text: string }) {
  return (
    <Flex flexDirection={'column'} gap={8}>
      <Text.Body>{text}</Text.Body>
      <Flex justifyContent={'space-between'}>
        <Flex gap={5}>
          <Button.IconButton>
            <Icon name="Pin" size={16} />
            <Text.Body> 23</Text.Body>
          </Button.IconButton>
          <Button.IconButton>
            <Icon name="Pin" size={16} />
            <Text.Body> 2</Text.Body>
          </Button.IconButton>
        </Flex>
        <Text.Body opacity={0.7}> ~lodlev-migdev</Text.Body>
      </Flex>
    </Flex>
  );
}
function ExampleComponents() {
  return (
    <Card p={3} elevation={4} bg="text" color="base">
      <Button.Base
        className="chat-info-edit-image"
        size={24}
        borderRadius={12}
        //onClick={onUpload}
      >
        <Icon name="Edit" size={16} />
      </Button.Base>
      <Text.H1>H1 text</Text.H1>
      <Text.Label>base input</Text.Label>
      <Input
        name="input-1"
        content="hello input"
        placeholder="some placeholder"
        title="title"
      ></Input>
      <Input
        name="input-1"
        content="hello input"
        placeholder="some placeholder"
        title="title"
      ></Input>
      <Input
        name="input-1"
        content="hello input"
        placeholder="some placeholder"
        title="title"
      ></Input>
      <TextInput
        id="space-color"
        name="color"
        height={34}
        required
        leftAdornment={<Text.Custom opacity={0.5}>#</Text.Custom>}
        rightAdornment={
          <Flex
            position="relative"
            justifyContent="flex-end"
            onClick={(e) => e.stopPropagation()}
          >
            <Icon name="Edit" size={16} />
          </Flex>
        }
        inputStyle={{
          width: 80,
        }}
        style={{
          borderRadius: 6,
          paddingRight: 0,
        }}
        value={''}
        error={false}
        onChange={() => null}
      />
    </Card>
  );
}

export default App;
