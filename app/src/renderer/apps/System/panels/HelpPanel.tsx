import { Anchor, Text } from '@holium/design-system/general';

import { SettingPane } from '../components/SettingPane';
import { SettingSection } from '../components/SettingSection';
import { SettingTitle } from '../components/SettingTitle';

export const HelpPanel = () => (
  <SettingPane>
    <SettingTitle title="Help" />
    <SettingSection
      title="Reach Out"
      body={
        <>
          <Text.Custom fontSize={2}>
            Send a DM to{' '}
            <Anchor
              href="https://twitter.com/HoliumCorp"
              rel="noreferrer"
              target="_blank"
              // m={0}
            >
              @HoliumCorp
            </Anchor>{' '}
            or check out our{' '}
            <Anchor
              href="https://holium.gitbook.io/realm"
              rel="noreferrer"
              target="_blank"
              // m={0}
            >
              documentation
            </Anchor>
            . We are usually pretty quick to respond.
          </Text.Custom>
        </>
      }
    />
  </SettingPane>
);
