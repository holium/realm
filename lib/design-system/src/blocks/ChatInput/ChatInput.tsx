import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Icon, Button, BoxProps, Flex, Spinner } from '../../general';
import { InputBox, TextArea } from '../../input';
import { ImageBlock } from '../ImageBlock/ImageBlock';
import { MediaBlock } from '../MediaBlock/MediaBlock';
import { isImageLink, parseMediaType } from '../../util/links';
import { FragmentType } from '../Bubble/Bubble.types';
import { FragmentImage } from '../Bubble/fragment-lib';
import { convertFragmentsToText, parseChatInput } from './fragment-parser';

const CHAT_INPUT_LINE_HEIGHT = 16;
const ChatBox = styled(TextArea)`
  resize: none;
  line-height: ${CHAT_INPUT_LINE_HEIGHT}px;
  font-size: 14px;
  padding-left: 4px;
  padding-right: 4px;
`;

const RemoveAttachmentButton = styled(motion.div)`
  position: relative;
  z-index: 4;
  transition: var(--transition);
  overflow: visible;
  ${FragmentImage} {
    padding: 0px;
  }
  ${Button.Base} {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .chat-attachment-remove-btn {
    position: absolute;
    display: flex;
    overflow: visible;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    top: -4px;
    right: -4px;
    z-index: 4;
    border-radius: 12px;
    transition: var(--transition);
  }
`;

type ChatInputProps = {
  id: string;
  disabled?: boolean;
  isFocused?: boolean;
  loading?: boolean;
  attachments?: string[];
  editingMessage?: FragmentType[];
  error?: string;
  onPaste?: (evt: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onSend: (fragments: FragmentType[]) => void;
  onEditConfirm: (fragments: FragmentType[]) => void;
  onCancelEdit?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  onAttachment?: () => void;
  onRemoveAttachment?: (index: number) => void;
} & BoxProps;

export const parseStringToFragment = (value: string): FragmentType[] => {
  const fragments = value.split(' ').map((fragment) => ({
    plain: fragment,
  }));
  return fragments;
};

export const ChatInput = ({
  id,
  loading,
  tabIndex,
  disabled,
  isFocused,
  editingMessage,
  attachments,
  error,
  onSend,
  onEditConfirm,
  onCancelEdit,
  onAttachment,
  onRemoveAttachment,
  onPaste,
  ...chatInputProps
}: ChatInputProps) => {
  const [rows, setRows] = useState(1);
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
    if (value.length < 25 && value.split('\n').length < 2) {
      setRows(1);
    } else {
      setRows(evt.target.scrollHeight / CHAT_INPUT_LINE_HEIGHT);
    }
  };

  const onFocus = (_evt: React.FocusEvent<HTMLTextAreaElement>) => {
    // TODO
    // console.log('onFocus', evt);
  };

  const onBlur = (_evt: React.FocusEvent<HTMLTextAreaElement>) => {
    // TODO
    // console.log('onBlur', evt);
  };

  const isDisabled =
    disabled ||
    loading ||
    (value.length === 0 && !attachments) ||
    (value.length === 0 && attachments && attachments.length === 0);

  const onKeyDown = (evt: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault();
      if (isDisabled) return;
      const fragments = onParseFragments();
      onSendClick(fragments);
    }
  };

  const onParseFragments = () => {
    const parsedFragments = value ? parseChatInput(value) : [];
    let attachmentFragments: FragmentType[] = [];
    if (attachments && attachments.length > 0) {
      attachmentFragments = attachments.map((attachment) => {
        if (isImageLink(attachment)) {
          return { image: attachment };
        } else {
          return {
            link: attachment,
          };
        }
      });
    }
    return [...attachmentFragments, ...parsedFragments];
  };

  const onSendClick = (parsedFragments: FragmentType[]) => {
    setValue('');
    if (editingMessage) {
      onEditConfirm(parsedFragments);
    } else {
      onSend(parsedFragments);
      setRows(1);
    }
  };

  return (
    <Flex flexDirection="column" overflow="visible">
      {attachments && (
        <Flex
          gap={8}
          overflow="visible"
          flexWrap="wrap"
          flexDirection="row"
          alignItems="flex-start"
        >
          {attachments.map((attachment: string, index: number) => {
            const { linkType } = parseMediaType(attachment);
            let block = null;
            if (linkType === 'image') {
              block = (
                <ImageBlock
                  mb={1}
                  minWidth={100}
                  width="fit-content"
                  showLoader
                  height={100}
                  id={`attachment-${index}`}
                  by={''}
                  image={attachment}
                />
              );
            } else {
              block = (
                <MediaBlock
                  mb={1}
                  width="fit-content"
                  minWidth={200}
                  height={100}
                  id={`attachment-${index}`}
                  url={attachment}
                />
              );
            }
            return (
              <RemoveAttachmentButton
                key={index}
                id={`attachment-image-${index}`}
              >
                {block}
                <motion.div className="chat-attachment-remove-btn">
                  <Button.Base
                    size={24}
                    borderRadius={12}
                    onClick={
                      onRemoveAttachment
                        ? (evt) => {
                            evt.stopPropagation();
                            onRemoveAttachment(index);
                          }
                        : undefined
                    }
                  >
                    <Icon name="Close" size={16} />
                  </Button.Base>
                </motion.div>
              </RemoveAttachmentButton>
            );
          })}
        </Flex>
      )}
      <InputBox
        inputId={id}
        disabled={disabled}
        height={
          rows === 1 ? 38 : CHAT_INPUT_LINE_HEIGHT * Math.min(rows, 5) + 6
        }
        py="3px"
        error={!!error}
        leftAdornment={
          <Button.IconButton
            ml={1}
            size={22}
            onClick={onAttachment}
            disabled={loading}
          >
            {loading ? (
              <Spinner size={0} />
            ) : (
              <Icon name="Attachment" size={20} opacity={0.5} />
            )}
          </Button.IconButton>
        }
        rightAdornment={
          <Flex>
            {editingMessage && (
              <Button.IconButton
                mr={1}
                disabled={isDisabled}
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
              disabled={isDisabled}
              onClick={(evt) => {
                evt.stopPropagation();
                const fragments = onParseFragments();
                onSendClick(fragments);
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
          value={value}
          tabIndex={tabIndex}
          disabled={disabled}
          style={{
            marginTop: rows === 1 ? '10px' : '3px',
            height: Math.min(rows, 5) * CHAT_INPUT_LINE_HEIGHT,
          }}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onPaste={onPaste}
          onKeyDown={onKeyDown}
        />
      </InputBox>
    </Flex>
  );
};
