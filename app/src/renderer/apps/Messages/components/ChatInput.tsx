// import {
//   FC,
//   useEffect,
//   useState,
//   useMemo,
//   useRef,
//   ChangeEventHandler,
// } from 'react';
// import { rgba, darken, lighten } from 'polished';
// import { observer } from 'mobx-react';
// import ScrollView from 'react-inverted-scrollview';
// import { toJS } from 'mobx';
// import {
//   Flex,
//   IconButton,
//   Icons,
//   Input,
//   Sigil,
//   Text,
//   Grid,
//   Box,
//   Spinner,
// } from 'renderer/components';
// import { ThemeModelType } from 'os/services/shell/theme.model';
// import { MessageType, ChatMessage } from './components/ChatMessage';
// import { createDmForm } from './forms/chatForm';
// import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
// import { useServices } from 'renderer/logic/store';
// import { DmActions } from 'renderer/logic/actions/chat';
// import { DMPreviewType } from 'os/services/ship/models/courier';
// import { ChatLog } from './components/ChatLog';
// import { ShipActions } from 'renderer/logic/actions/ship';
// import S3Client from 'renderer/logic/s3/S3Client';
// import {
//   FileUploadSource,
//   useFileUpload,
// } from 'renderer/logic/lib/useFileUpload';

// export const ChatInput: FC<any> = (props: any) => {
//   return (
//     <Flex flex={1} pr={3} alignItems="center">
//       <input
//         style={{ display: 'none' }}
//         ref={inputRef}
//         type="file"
//         accept="image/*,.txt,.pdf"
//         // @ts-ignore
//         onChange={handleFileChange}
//       />
//       <IconButton
//         style={{ cursor: 'none' }}
//         color={iconColor}
//         customBg={dockColor}
//         ml={3}
//         mr={3}
//         size={28}
//         onClick={(evt: any) => {
//           evt.stopPropagation();
//           // @ts-ignore
//           promptUpload((err) => {
//             console.log(err);
//           }).then((url) => uploadSuccess(url, 'direct'));
//           // TODO add file uploading
//         }}
//       >
//         <Icons name="Attachment" />
//       </IconButton>
//       <Input
//         as="textarea"
//         ref={chatInputRef}
//         tabIndex={1}
//         rows={rows}
//         autoFocus
//         name="dm-message"
//         shouldHighlightOnFocus
//         className="realm-cursor-text-cursor"
//         width="100%"
//         placeholder="Write a message"
//         rightInteractive
//         onKeyDown={submitDm}
//         rightIcon={
//           <Flex justifyContent="center" alignItems="center">
//             {isSending ? (
//               <Flex
//                 mr={1}
//                 width="24"
//                 height="24"
//                 justifyContent="center"
//                 alignItems="center"
//               >
//                 <Spinner size={0} />
//               </Flex>
//             ) : (
//               <IconButton
//                 ref={submitRef}
//                 luminosity={mode}
//                 size={24}
//                 canFocus={false}
//                 onKeyDown={submitDm}
//               >
//                 <Icons opacity={0.5} name="ArrowRightLine" />
//               </IconButton>
//             )}
//           </Flex>
//         }
//         onChange={(e: any) => dmMessage.actions.onChange(e.target.value)}
//         onFocus={() => dmMessage.actions.onFocus()}
//         onBlur={() => dmMessage.actions.onBlur()}
//         wrapperStyle={{
//           height: 'max-content',
//           borderRadius: 9,
//           // borderWidth: 0,
//           borderColor: 'transparent',
//           backgroundColor:
//             theme.mode === 'dark'
//               ? lighten(0.1, windowColor)
//               : darken(0.055, windowColor),
//         }}
//       />
//     </Flex>
//   );
// };
