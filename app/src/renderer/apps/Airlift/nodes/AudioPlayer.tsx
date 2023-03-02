import { Flex, Icon, Text } from '@holium/design-system';
import styled from 'styled-components';

const AudioPlayerRect = styled.div`
  /* Rectangle 3744 */
  width: 557px;
  height: 81px;

  background: #d9d9d9;
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PlayButton = styled.div`
  /* Ellipse 9 */

  position: relative;
  width: 59px;
  height: 59px;

  background: #c1c4c6;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center; /* add this line to center the Icon */
`;

export function AudioPlayer({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <AudioPlayerRect>
        <Flex flexDirection="column" ml={5} gap={10}>
          <Text.H4>
            {' '}
            #Twice x #BasedRetardGang Likey likey Loop on Cyber Summerstone
            Castlez x44
          </Text.H4>
          <Text.H6 opacity={0.6}>~novned-tidsyl</Text.H6>
        </Flex>
        <Flex mr={5}>
          <PlayButton>
            <Icon mt={1} ml={2} name="AudioPlayButton" size={30} />
          </PlayButton>
        </Flex>
      </AudioPlayerRect>
    </Flex>
  );
}
