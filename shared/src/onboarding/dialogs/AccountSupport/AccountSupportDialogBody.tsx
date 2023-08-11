import { ErrorBox, Flex, SuccessBox } from '@holium/design-system/general';

import {
  AccountDialogDescription,
  AccountDialogTitle,
} from '../../components/AccountDialog.styles';

const getSupportEmail = (patp?: string) =>
  `mailto:support@holium.com?subject=Hosting Support${
    patp ? ` for ${patp}` : ''
  }&body=A picture is worth a thousand words. Please attach any screenshots that may help us understand your issue.`;

type Props = {
  alerts: string[];
};

export const AccountSupportDialogBody = ({ alerts }: Props) => (
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
        <a href={`mailto:${getSupportEmail((window as any).ship)}`}>
          support@holium.com
        </a>
        .
      </AccountDialogDescription>
    </Flex>
  </>
);
