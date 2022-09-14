import { Patp } from 'os/types';
import { FC } from 'react';
import { useTrayApps } from 'renderer/apps/store';
import { Flex, Grid, Icons, Text } from 'renderer/components';
// import Row from 'renderer/components/Row';
import styled from 'styled-components';
import { Row } from 'renderer/components/NewRow';
import { useServices } from 'renderer/logic/store';


interface RoomInfoProps {}


const swid = '75px'
const bwid = '175px'

const Key = styled(Text)`
  width:${swid};
  max-width:${swid};
  min-width:${swid};
`;

const Value = styled(Text)`
  width:${bwid};
  max-width:${bwid};
  min-width:${bwid};
`;

export const RoomInfo: FC<RoomInfoProps> = (props: RoomInfoProps) => {
  const { roomsApp } = useTrayApps();
  const room = roomsApp.liveRoom!;
  const { desktop } = useServices();
  const theme = desktop.theme;

  const rowGap = 16
  



  return (
    
    <Flex flex={2} p={2} mt={6}
      flexDirection="column"
      alignItems="center"
      opacity={0.7}
      style={{
        overflowWrap: 'break-word'
      }}
      >

        <Flex flexDirection='row' gap={16} width={'80%'} pb={16}>
            <Key>
            Creator:
            </Key>
            <Value>
            {/* {room.creator} */}
            ~sampel-palnet-sampel-palnet  
            </Value>
        </Flex>

        <Flex flexDirection='row' gap={16} width={'80%'} pb={16}>
            <Key>
            Access:
            </Key>
            <Value>
            {room.access}
            </Value>
        </Flex>

        <Flex flexDirection='row' gap={16} width={'80%'} pb={16}>
           <Key>
            Capacity:
            </Key>
            <Value>
            {`${room.present.length}/${room.capacity}`}
            </Value>
        </Flex>

        <Flex flexDirection='row' gap={16} width={'80%'} pb={16}>
             <Key>
            Whitelist:
            </Key>
            <Flex width={bwid} maxWidth={bwid} minWidth={bwid}
              flexDirection={'column'}
              maxHeight={'120px'}
              overflowY={'scroll'}>
              {room.whitelist.map((patp: Patp, index: number) => {
                return (
                  <Flex key={`room-whitelist-${patp}`} mb={2}>
                    <Text>{patp}</Text>
                  </Flex>
                  )})}
          </Flex>
        </Flex>
          
    </Flex>
  );
};
