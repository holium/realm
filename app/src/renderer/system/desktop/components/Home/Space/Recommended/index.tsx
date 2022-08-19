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
    id: 'chess',
    title: 'Chess',
    info: 'Fully peer-to-peer chess over Urbit',
    color: '#ffffff',
    type: 'urbit',
    image: 'https://peekabooo.icu/images/finmep-chess.svg',
    href: {
      glob: {
        base: 'chess',
        'glob-reference': {
          location: {
            http: 'https://peekabooo.icu/globs/chess/glob-0v3.3n0s3.36rnr.racns.d87rd.42bhb.glob',
          },
          hash: '0v3.3n0s3.36rnr.racns.d87rd.42bhb',
        },
      },
    },
    version: '0.9.1',
    website: 'https://github.com/ashelkovnykov/urbit-chess',
    license: 'GPL3',
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

        {([].length === 0 && (
          <Text variant="h6">
            No recommendations. Start liking apps in this space to show them
            here!
          </Text>
        )) ||
          [].map((app: any) => {
            return (
              <Flex flex={2} flexWrap="wrap">
                <Flex key={app.id} flex={1}>
                  <AppPreview app={app} />
                </Flex>
              </Flex>
            );
          })}
      </Flex>
    );
  }
);
