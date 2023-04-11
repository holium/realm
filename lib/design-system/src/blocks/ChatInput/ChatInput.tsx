import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Icon, Button, BoxProps, Flex, Spinner } from '../../../general';
import { InputBox, TextArea } from '../../../inputs';
import { ImageBlock } from '../ImageBlock/ImageBlock';
import { MediaBlock } from '../MediaBlock/MediaBlock';
import { isImageLink, parseMediaType } from '../../util/links';
import { FragmentType } from '../Bubble/Bubble.types';
import { FragmentImage } from '../Bubble/fragment-lib';
import { convertFragmentsToText, parseChatInput } from './fragment-parser';
import { Reply } from '../Bubble/Reply';

const CHAT_INPUT_LINE_HEIGHT = 22;
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
  selectedChatPath: string;
  disabled?: boolean;
  isFocused?: boolean;
  loading?: boolean;
  attachments?: string[];
  containerWidth?: number;
  replyTo?: {
    id: string;
    author: string;
    authorColor: string;
    sentAt: string;
    message: FragmentType[];
  };
  editingMessage?: FragmentType[];
  error?: string;
  themeMode?: 'light' | 'dark';
  onPaste?: (evt: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onSend: (fragments: FragmentType[]) => void;
  onEditConfirm: (fragments: FragmentType[]) => void;
  onCancelEdit?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  onCancelReply?: () => void;
  onAttachment?: () => void;
  onRemoveAttachment?: (index: number) => void;
  onBlur: () => void;
} & BoxProps;

export const parseStringToFragment = (value: string): FragmentType[] => {
  const fragments = value.split(' ').map((fragment) => ({
    plain: fragment,
  }));
  return fragments;
};

const attachmentHeight = 116;
const replyHeight = 46;

export const ChatInput = ({
  id,
  selectedChatPath,
  replyTo,
  loading,
  tabIndex,
  disabled,
  isFocused,
  editingMessage,
  attachments,
  error,
  containerWidth,
  themeMode,
  onSend,
  onEditConfirm,
  onCancelEdit,
  onCancelReply,
  onAttachment,
  onRemoveAttachment,
  onPaste,
  onBlur,
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
      if (inputRef.current && isFocused) {
        inputRef.current.value = parsedFragments;
        changeRows(inputRef.current.value, inputRef.current.scrollHeight);
        inputRef.current.focus();
        setValue(parsedFragments);
      } else {
        inputRef.current?.blur();
      }
    }
  }, [editingMessage]);

  const changeRows = (newValue: string, scrollHeight: number) => {
    if (newValue.length < 30 && newValue.split('\n').length < 2) {
      setRows(1);
    } else if (newValue.split('\n').length < value.split('\n').length) {
      setRows(rows - 1);
    } else {
      setRows(scrollHeight / CHAT_INPUT_LINE_HEIGHT);
    }
    setValue(newValue);
  };

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    changeRows(evt.target.value, evt.target.scrollHeight);
    setValue(evt.target.value);
  };

  const onFocus = (evt: React.FocusEvent<HTMLTextAreaElement>) => {
    const savedChat = localStorage.getItem(selectedChatPath);
    if (savedChat) {
      const savedChatAndType = JSON.parse(savedChat);
      if (savedChatAndType.isNew === !editingMessage) {
        evt.target.value = savedChatAndType.value;
        onChange(evt);
      }
    }
  };

  const handleOnBlur = (_evt: React.FocusEvent<HTMLTextAreaElement>) => {
    if (value) {
      const isNew = editingMessage ? false : true;
      localStorage.setItem(
        selectedChatPath,
        JSON.stringify({ isNew: isNew, value: value })
      );
    } else {
      localStorage.removeItem(selectedChatPath);
    }
    onBlur();
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
    localStorage.removeItem(selectedChatPath);
    setValue('');
    if (editingMessage) {
      onEditConfirm(parsedFragments);
      setRows(1);
    } else {
      onSend(parsedFragments);
      setRows(1);
    }
  };

  return (
    <Flex flexDirection="column" overflow="visible" width={containerWidth}>
      <InputBox
        inputId={id}
        px={0}
        disabled={disabled}
        height={
          rows === 1 ? 36 : CHAT_INPUT_LINE_HEIGHT * Math.min(rows, 5) + 20
        }
        py="3px"
        error={!!error}
        borderRadius={24}
        {...chatInputProps}
      >
        <Flex
          flexDirection="column"
          width={containerWidth ? containerWidth - 2 : undefined}
          py={2}
          px={2}
          justifyContent="flex-end"
        >
          {attachments && attachments.length > 0 ? (
            <Flex
              pt="4px"
              px="4px"
              mb="12px"
              gap={8}
              flexDirection="row"
              height={attachmentHeight}
              overflowX="auto"
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
          ) : null}
          {replyTo ? (
            <Flex
              mt="6px"
              mx="4px"
              mb="12px"
              gap={8}
              flexDirection="row"
              height={replyHeight}
              overflowX="hidden"
              alignItems="flex-start"
            >
              <Reply
                id={replyTo.id}
                author={replyTo.author}
                authorColor={replyTo.authorColor}
                themeMode={themeMode}
                containerWidth={
                  containerWidth ? containerWidth - 10 : undefined
                }
                message={replyTo.message}
                sentAt={replyTo.sentAt}
                onCancel={onCancelReply}
              />
            </Flex>
          ) : null}
          <Flex width="100%" flexDirection="row" alignItems="flex-end" gap={4}>
            <Flex>
              <Button.IconButton
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
            </Flex>
            <ChatBox
              id={id}
              ref={inputRef}
              name="chat-input"
              placeholder="New message"
              value={value}
              tabIndex={tabIndex}
              disabled={disabled}
              style={{
                marginTop: 0,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                height: Math.min(rows, 5) * CHAT_INPUT_LINE_HEIGHT,
              }}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={handleOnBlur}
              onPaste={onPaste}
              onKeyDown={onKeyDown}
            />

            <Flex>
              {editingMessage && (
                <Button.IconButton
                  mr={1}
                  disabled={false}
                  onClick={(evt) => {
                    setValue('');
                    setRows(1);
                    if (onCancelEdit) onCancelEdit(evt);
                  }}
                >
                  <Icon name="Close" size={20} opacity={0.5} />
                </Button.IconButton>
              )}
              <Button.IconButton
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
          </Flex>
        </Flex>
      </InputBox>
    </Flex>
  );
};
