import { observer } from 'mobx-react';

import { Anchor, Text } from '@holium/design-system';

import { SettingPane } from '../components/SettingPane';
import { SettingSection } from '../components/SettingSection';
import { SettingTitle } from '../components/SettingTitle';

const HelpPanelPresenter = () => {
  return (
    <SettingPane>
      <SettingTitle title="Help" />
      <SettingSection>
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
      </SettingSection>
      {/* <Text.Custom fontSize={7} fontWeight={500} mb={3}>
        Help
      </Text.Custom>
      <Card p="20px" width="100%" elevation={0}>
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
      </Card> */}
    </SettingPane>
  );
};

export const HelpPanel = observer(HelpPanelPresenter);
