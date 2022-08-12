import { FC } from 'react';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { Flex, Text } from 'renderer/components';
import { AppPreview } from './AppPreview';
import { AppModelType } from 'os/services/ship/models/docket';

type RecommendedAppsProps = {
  isOpen?: boolean;
};

const sampleApps = [
  {
    id: 'sphinx',
    title: 'sphinx',
    info: 'A search engine powered by you and your pals for finding answers to your riddles',
    color: '#b25068',
    type: 'urbit',
    image:
      'https://nyc3.digitaloceanspaces.com/hmillerdev/nocsyx-lassul/2022.7.16..04.35.22-sphinx-web-shifted.svg',
    href: {
      glob: {
        base: 'sphinx',
        'glob-reference': {
          location: {
            http: 'https://nyc3.digitaloceanspaces.com/hmillerdev/sphinx/glob-0v7.folii.k685s.mjn1b.46up6.but26.glob',
          },
          hash: '0v7.folii.k685s.mjn1b.46up6.but26',
        },
      },
    },
    version: '0.4.6',
    website: 'https://github.com',
    license: 'MIT',
  },
  {
    id: 'campfire',
    title: 'Campfire',
    info: 'Hang out with your friends. Voice and video chat by Holium.',
    color: '#ffc179',
    type: 'urbit',
    image:
      'https://raw.githubusercontent.com/datryn-ribdun/urbit-webrtc/master/campfire/logo.svg',
    href: {
      glob: {
        base: 'campfire',
        'glob-reference': {
          location: {
            ames: '~dister-dister-datryn-ribdun',
          },
          hash: '0vibu41.fj3s4.s7p7a.1lgc8.62pav',
        },
      },
    },
    version: '0.1.3',
    website: 'https://github.com/datryn-ribdun/urbit-webrtc',
    license: 'MIT',
  },
];

export const RecommendedApps: FC<RecommendedAppsProps> = observer(
  (props: RecommendedAppsProps) => {
    const { isOpen } = props;
    const { spaces } = useServices();

    return (
      <Flex flexGrow={0} flexDirection="column" gap={20} mb={60}>
        <Text variant="h3" fontWeight={500}>
          Recommended Apps
        </Text>
        <Flex flex={2} flexWrap="wrap">
          {sampleApps.map((app: any) => {
            console.log(app);
            return (
              <Flex key={app.id} flex={1}>
                <AppPreview app={app} />
              </Flex>
            );
          })}
        </Flex>
      </Flex>
    );
  }
);
