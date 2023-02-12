import { useState, useRef } from 'react';
import styled from 'styled-components';
import { Icon, Button, InputBox, BoxProps, TextArea, Flex } from '../..';
import { FragmentType } from '../Bubble/Bubble.types';
import { parseChatInput } from './fragment-parser';

const ChatBox = styled(TextArea)`
  resize: none;
  line-height: 30px;
  font-size: 14px;
  padding-left: 4px;
  padding-right: 4px;
`;

type ChatInputProps = {
  id: string;
  disabled?: boolean;
  onSend: (fragments: FragmentType[]) => void;
  onAttachment?: (file: any) => void;
} & BoxProps;

export const parseStringToFragment = (value: string): FragmentType[] => {
  const fragments = value.split(' ').map((fragment) => ({
    plain: fragment,
  }));
  return fragments;
};

export const ChatInput = ({
  id,
  tabIndex,
  disabled,
  onSend,
  onAttachment,
  ...chatInputProps
}: ChatInputProps) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = evt.target;
    setValue(value);
  };

  const onFocus = (evt: React.FocusEvent<HTMLTextAreaElement>) => {
    // console.log('onFocus', evt);
  };

  const onBlur = (evt: React.FocusEvent<HTMLTextAreaElement>) => {
    // console.log('onBlur', evt);
  };

  const onKeyDown = (evt: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault();
      if (value.length === 0) return;
      const parsedFragments = parseChatInput(value);
      setValue('');
      onSend(parsedFragments);
    }
  };

  return (
    <InputBox
      inputId={id}
      disabled={disabled}
      height={36}
      py="3px"
      leftAdornment={
        <Button.IconButton
          ml={1}
          onClick={() => {
            // onAttachment();
          }}
        >
          <Icon name="Attachment" size={20} opacity={0.5} />
        </Button.IconButton>
      }
      rightAdornment={
        <Flex>
          <Button.IconButton
            mr={1}
            disabled={value.length === 0}
            onClick={() => {
              const parsedFragments = parseChatInput(value);
              setValue('');
              onSend(parsedFragments);
            }}
          >
            <Icon name="ArrowRightLine" size={20} opacity={0.5} />
          </Button.IconButton>
        </Flex>
      }
      {...chatInputProps}
      borderRadius={24}
    >
      <ChatBox
        id={id}
        ref={inputRef}
        required
        name="chat-input"
        placeholder="New message"
        rows={1}
        value={value}
        tabIndex={tabIndex}
        disabled={disabled}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
    </InputBox>
    // <TextInput
    //   id={id}
    //   width={300}
    //   name="test-input-3"
    //   type="text"
    //   placeholder="New Message"
    //   rightAdornment={
    //     <Button.IconButton
    //       onClick={() => {
    //         onSend(fragments);
    //       }}
    //     >
    //       <Icon name="ArrowRightLine" opacity={0.5} />
    //     </Button.IconButton>
    //   }
    // />
  );
};
