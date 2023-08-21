import Image from 'next/image';
import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';
import { HoliumButton } from '@holium/design-system/os';

import { MOBILE_WIDTH } from '../../constants';

const LogoRow = styled(Flex)`
  align-items: center;
  justify-content: center;
  gap: 32px;

  @media (max-width: ${MOBILE_WIDTH}px) {
    flex-direction: column-reverse;
  }
`;

const IdealCityRow = styled(Flex)`
  gap: 32px;

  @media (max-width: ${MOBILE_WIDTH}px) {
    flex-direction: column;
  }
`;

const Body = styled(Text.Body)`
  font-size: 16px;
  line-height: 1.8em;
`;

const ImageCaption = styled(Text.Body)`
  font-size: 12px;
  opacity: 0.7;
`;

export const HoliumLogoSection = () => (
  <>
    <LogoRow>
      <Flex flex={1}>
        <Body>
          Holium's logo, inspired in part by Fra Carnevale's "Ideal City,"
          symbolizes our pursuit of transcendent and utopian goals. Our
          commitment is to shape a sovereign digital future that aligns with
          higher principles of human existence. At Holium, we strive to build an
          'Ideal Digital City' with our decentralized tech.
        </Body>
      </Flex>
      <Flex width={200} alignItems="center" justifyContent="center">
        <HoliumButton size={150} pointer={false} />
      </Flex>
    </LogoRow>
    <IdealCityRow>
      <Flex flex={1} flexDirection="column" gap="16px">
        <Flex
          width="100%"
          position="relative"
          maxWidth="700px"
          height="200px"
          justifyContent="center"
        >
          <Image alt="The Ideal City" src="/graphics/idealCity.png" fill />
        </Flex>
        <ImageCaption>
          The ideal city by Fra Carnevale, c. 1480–1484
        </ImageCaption>
      </Flex>
      <Flex flexDirection="column" gap="16px">
        <Image
          alt="Overhead of the Ideal City"
          src="/graphics/idealCityOverhead.png"
          width={200}
          height={200}
        />
        <ImageCaption>Overhead sketch of the ideal city</ImageCaption>
      </Flex>
    </IdealCityRow>
  </>
);
