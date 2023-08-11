import { ErrorBox, Flex, SuccessBox } from '@holium/design-system/general';

import {
  AccountDialogDescription,
  AccountDialogTitle,
} from '../../components/AccountDialog.styles';
import { getSupportMailTo, SUPPORT_EMAIL_ADDRESS } from './helpers';

type Props = {
  patp: string | undefined;
  alerts: string[];
};

export const AccountSupportDialogBody = ({ patp, alerts }: Props) => (
  <>
    <Flex flexDirection="column" gap="8px">
      <AccountDialogTitle>Status Page</AccountDialogTitle>
      {alerts.length > 0 ? (
        alerts.map((alert, index) => <ErrorBox key={index}>{alert}</ErrorBox>)
      ) : (
        <SuccessBox>Everything's operational</SuccessBox>
      )}
    </Flex>
    <Flex flexDirection="column" gap="8px">
      <AccountDialogTitle>Contact Us</AccountDialogTitle>
      <AccountDialogDescription>
        If you have any questions or concerns, please contact us at{' '}
        <a href={getSupportMailTo(patp, 'HOSTING issue')}>
          {SUPPORT_EMAIL_ADDRESS}
        </a>
        .
      </AccountDialogDescription>
    </Flex>
  </>
);
