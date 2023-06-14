import { Button, Flex, Text } from '@holium/design-system/general';

import { GrayButton } from '../../components/ChangeButton';
import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { OrDivider } from '../../components/OrDivider';
import { GetIdIcon } from '../../icons/GetIdIcon';
import { GrayBox, InfoText } from './GetRealmDialogBody.styles';

type Props = {
  onPurchaseId: () => void;
  onMigrateId: () => void;
};

export const GetRealmDialogBody = ({ onPurchaseId, onMigrateId }: Props) => (
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
          <Flex gap="12px">
            <Button.Primary type="button" onClick={onPurchaseId}>
              <Text.Body
                style={{
                  fontWeight: 500,
                  color: 'inherit',
                  margin: '2px',
                }}
              >
                Purchase ID
              </Text.Body>
            </Button.Primary>
            <GrayButton onClick={onMigrateId}>
              <Text.Body
                style={{
                  fontWeight: 500,
                  color: 'inherit',
                  margin: '2px',
                }}
              >
                Migrate ID
              </Text.Body>
            </GrayButton>
          </Flex>
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
      We’ll be adding more options for getting on Realm such as migrating your
      server or booting with an identity keyfile.
    </InfoText>
  </>
);
