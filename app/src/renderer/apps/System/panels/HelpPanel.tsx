import { Anchor, Text } from '@holium/design-system/general';
import { getSupportMailTo, SUPPORT_EMAIL_ADDRESS } from '@holium/shared';

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
            If you have any questions or concerns, please contact us at{' '}
            <Anchor
              href={getSupportMailTo((window as any).ship, 'REALM issue')}
              rel="noreferrer"
              target="_blank"
            >
              {SUPPORT_EMAIL_ADDRESS}
            </Anchor>{' '}
            or check out our{' '}
            <Anchor
              href="https://holium.gitbook.io/realm"
              rel="noreferrer"
              target="_blank"
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
