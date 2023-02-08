import { useState, useCallback } from 'react';
import {
  Flex,
  Text,
  Icon,
  Button,
  InputBox,
  TextInput,
  Input,
} from '@holium/design-system';
import {
  PreviewDMType,
  PreviewGroupDMType,
  DMPreviewType,
} from 'os/services/ship/models/courier';
import { useTrayApps } from '../store';

export const CourierRoot = () => {
  const { dimensions, dmApp } = useTrayApps();
  const [searchString, setSearchString] = useState<string>('');

  const searchFilter = useCallback(
    (preview: DMPreviewType) => {
      if (!searchString || searchString.trim() === '') return true;
      let to: string;
      if (preview.type === 'group' || preview.type === 'group-pending') {
        const dm = preview as PreviewGroupDMType;
        to = Array.from(dm.to).join(', ');
      } else {
        const dm = preview as PreviewDMType;
        to = dm.to;
      }
      return to.indexOf(searchString) === 0;
    },
    [searchString]
  );

  return (
    <Flex flexDirection="column">
      <Flex mb={2} flexDirection="row" alignItems="center">
        <Flex width={26}>
          <Icon name="Messages" size={24} opacity={0.8} />
        </Flex>
        <Text.Custom
          flex={1}
          opacity={0.8}
          textAlign="center"
          fontSize={17}
          fontWeight={500}
        >
          Messages
        </Text.Custom>
        <Button.IconButton
          className="realm-cursor-hover"
          size={26}
          onClick={(evt) => {
            evt.stopPropagation();
            dmApp.setView('new-chat');
          }}
        >
          <Icon name="Plus" size={24} opacity={0.7} />
        </Button.IconButton>
      </Flex>
      <Flex py={1}>
        <InputBox
          width="100%"
          borderRadius={16}
          height={36}
          inputId="dm-search"
        >
          <Input
            id="dm-search"
            name="dm-search"
            style={{
              padding: '0px 6px',
              height: 26,
            }}
            placeholder="Search"
            onChange={(evt: any) => {
              evt.stopPropagation();
              setSearchString(evt.target.value);
            }}
          />
        </InputBox>
      </Flex>
    </Flex>
  );
};
