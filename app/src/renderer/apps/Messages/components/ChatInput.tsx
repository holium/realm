import { FC } from 'react';
import { InputWrapper } from 'renderer/components';

export const ChatInput: FC<any> = (props: any) => {
  return (
    <InputWrapper
      className="realm-cursor-text-cursor"
      alignItems="center"
      position="relative"
    >
      <span className="input" role="textbox" contentEditable></span>
    </InputWrapper>
  );
};
