import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Icon, Button, InputBox, BoxProps, TextArea, Flex } from '../..';
import { FragmentType } from '../Bubble/Bubble.types';
import { convertFragmentsToText, parseChatInput } from './fragment-parser';

const ChatBox = styled(TextArea)`
  resize: none;
  line-height: 36px;
  font-size: 14px;
  padding-left: 4px;
  padding-right: 4px;
`;

type ChatInputProps = {
  id: string;
  disabled?: boolean;
  isFocused?: boolean;
  editingMessage?: FragmentType[];
  onSend: (fragments: FragmentType[]) => void;
  onEditConfirm: (fragments: FragmentType[]) => void;
  onAttachment?: () => void;
  onCancelEdit?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
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
  isFocused,
  editingMessage,
  onSend,
  onEditConfirm,
  onAttachment,
  onCancelEdit,
  ...chatInputProps
}: ChatInputProps) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current && isFocused) {
      inputRef.current.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isFocused, inputRef]);

  useEffect(() => {
    if (editingMessage) {
      const parsedFragments = convertFragmentsToText(editingMessage);
      setValue(parsedFragments);
      if (inputRef.current && isFocused) {
        inputRef.current.focus();
      } else {
        inputRef.current?.blur();
      }
    }
  }, [editingMessage]);

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = evt.target;
    setValue(value);
  };

  const onFocus = (_evt: React.FocusEvent<HTMLTextAreaElement>) => {
    // TODO
    // console.log('onFocus', evt);
  };

  const onBlur = (_evt: React.FocusEvent<HTMLTextAreaElement>) => {
    // TODO
    // console.log('onBlur', evt);
  };

  const onKeyDown = (evt: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault();
      if (value.length === 0) return;
      const parsedFragments = parseChatInput(value);
      setValue('');
      if (editingMessage) {
        onEditConfirm(parsedFragments);
      } else {
        onSend(parsedFragments);
      }
    }
  };

  return (
    <InputBox
      inputId={id}
      disabled={disabled}
      height={36}
      py="3px"
      leftAdornment={
        <Button.IconButton ml={1} onClick={onAttachment}>
          <Icon name="Attachment" size={20} opacity={0.5} />
        </Button.IconButton>
      }
      rightAdornment={
        <Flex>
          {editingMessage && (
            <Button.IconButton
              mr={1}
              disabled={value.length === 0}
              onClick={(evt) => {
                setValue('');
                if (onCancelEdit) onCancelEdit(evt);
              }}
            >
              <Icon name="Close" size={20} opacity={0.5} />
            </Button.IconButton>
          )}
          <Button.IconButton
            mr={1}
            disabled={value.length === 0}
            onClick={() => {
              const parsedFragments = parseChatInput(value);
              setValue('');
              if (editingMessage) {
                onEditConfirm(parsedFragments);
              } else {
                onSend(parsedFragments);
              }
            }}
          >
            <Icon
              name={editingMessage ? 'Check' : 'ArrowRightLine'}
              size={20}
              opacity={0.5}
            />
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
