import { FC, useState, useRef } from 'react';
import styled from 'styled-components';
import { Icon, Button, InputBox, BoxProps, TextArea } from '../..';
import { FragmentType } from '../Bubble/Bubble.types';
import { parseChatInput } from './fragment-parser';

const ChatBox = styled(TextArea)`
  resize: none;
`;

type ChatInputProps = {
  id: string;
  disabled?: boolean;
  onSend: (fragments: FragmentType[]) => void;
} & BoxProps;

export const parseStringToFragment = (value: string): FragmentType[] => {
  const fragments = value.split(' ').map((fragment) => ({
    plain: fragment,
  }));
  return fragments;
};

export const ChatInput: FC<ChatInputProps> = (props: ChatInputProps) => {
  const { id, tabIndex, disabled, onSend, ...chatInputProps } = props;
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [fragments, setFragments] = useState<FragmentType[]>([]);

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = evt.target;
    const newFragments = value.split(' ').map((fragment) => ({
      plain: fragment,
    }));
    setFragments(newFragments);
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
      height={48}
      borderRadius={16}
      rightAdornment={
        <Button.IconButton
          disabled={value.length === 0}
          onClick={() => {
            const parsedFragments = parseChatInput(value);
            onSend(parsedFragments);
          }}
        >
          <Icon name="ArrowRightLine" size={20} opacity={0.5} />
        </Button.IconButton>
      }
      {...chatInputProps}
    >
      <ChatBox
        id={id}
        ref={inputRef}
        required
        name="chat-input"
        placeholder="New message"
        rows={2}
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
