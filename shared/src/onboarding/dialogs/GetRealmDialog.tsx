import styled from 'styled-components';

import { Button, Flex, Text } from '@holium/design-system/general';

import { OnboardDialog } from '../components/OnboardDialog';
import {
  MOBILE_WIDTH,
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../components/OnboardDialog.styles';
import { OrDivider } from '../components/OrDivider';
import { GetIdIcon } from '../icons/GetIdIcon';

const GrayBox = styled(Flex)`
  padding: 16px;
  gap: 16px;
  background-color: rgba(var(--rlm-border-rgba), 0.5);
  border: 1px solid rgba(var(--rlm-border-rgba));
  border-radius: 12px;

  @media (max-width: ${MOBILE_WIDTH}px) {
    padding: 32px;
    .hideonmobile {
      display: none;
    }
  }
`;

const InfoText = styled(OnboardDialogDescription)`
  font-size: 12px;
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
  opacity: 0.7;
`;

type Props = {
  onBack: () => void;
  onGetANewId: () => void;
};

export const GetRealmDialog = ({ onBack, onGetANewId }: Props) => (
  <OnboardDialog
    body={
      <>
        <OnboardDialogTitle
          style={{
            marginTop: -29,
          }}
        >
          Congratulations, you're on the waitlist!
        </OnboardDialogTitle>
        <OnboardDialogDescription>
          We'll notify you as soon as we open up capacity.{' '}
        </OnboardDialogDescription>
        <OrDivider maxWidth="90%" />
        <GrayBox>
          <Flex flex={1} alignItems="center" justifyContent="center" gap="16px">
            <Flex flexDirection="column" gap="16px" alignItems="center">
              <OnboardDialogDescription>Want in now?</OnboardDialogDescription>
              <Button.Primary type="button" onClick={onGetANewId}>
                <Text.Body
                  style={{
                    fontWeight: 500,
                    color: '#ffffff',
                    margin: '2px',
                  }}
                >
                  Purchase ID
                </Text.Body>
              </Button.Primary>
            </Flex>
          </Flex>
          <Flex
            flex={1}
            alignItems="center"
            justifyContent="center"
            className="hideonmobile"
          >
            <GetIdIcon size={240} />
          </Flex>
        </GrayBox>
        <InfoText>
          We’ll be adding more options for getting on Realm such as migrating
          your server or booting with an identity keyfile.
        </InfoText>
      </>
    }
    hideNextButton
    onBack={onBack}
  />
);
