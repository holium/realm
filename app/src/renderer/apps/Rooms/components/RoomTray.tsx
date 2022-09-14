import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { Grid, Text, Flex, Icons, Sigil } from 'renderer/components';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { Row } from 'renderer/components/NewRow';
import { useServices } from 'renderer/logic/store';
import { AvatarRow } from './AvatarRow';
import { RoomsModelType } from 'os/services/tray/rooms.model';

type RoomTrayProps = RoomsModelType & {
  onClick: (evt: any) => any;
};

// export const RoomTray: FC<RoomTrayProps> = observer((props: RoomTrayProps) => {
//   const { title, creator, present, cursors, onClick } = props;
//   const { desktop, ship } = useServices();

//   const { backgroundColor, textColor, windowColor, iconColor } = desktop.theme;

//   let peopleText = 'people';
//   if (present.length === 1) {
//     peopleText = 'person';
//   }

//   return (
//     <Row
//       className="realm-cursor-hover"
//       customBg={windowColor}
//       onClick={(evt: any) => onClick(evt)}
//     >
//       <Flex flex={1} justifyContent="space-between" flexDirection="row">
//         <Flex gap={2} flexDirection="column">
//           <Text fontWeight={500} fontSize={'15px'}>
//             {title}
//           </Text>
//           <Flex flexDirection="row">
//             <Icons mr={1} opacity={0.5} name="Friends" />
//             <Text opacity={0.5} fontWeight={400} fontSize={2}>
//               {present.length} {peopleText}{' '}
//               {creator === ship?.patp && `  -  Hosting`}
//             </Text>
//           </Flex>
//         </Flex>
//         <AvatarRow people={present} backgroundColor={windowColor} />
//       </Flex>
//     </Row>
//   );
// });
