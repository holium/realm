import { GetServerSideProps } from 'next';

import { GetRealmDialog } from '@holium/shared';

import { Page } from '../components/Page';
import { useNavigation } from '../util/useNavigation';
import { joinWaitlist } from './account/get-realm';

type Props = {
  prefilledEmail: string;
};

export const getServerSideProps: GetServerSideProps = async ({
  query,
  res,
}) => {
  const prefilledEmail = (query.email ?? '') as string;

  if (!prefilledEmail) {
    res.writeHead(302, { Location: '/' });
    res.end();
  }

  const result = await joinWaitlist(prefilledEmail);

  if (!result) {
    res.writeHead(302, { Location: '/join-failed' });
    res.end();
  }

  return {
    props: {
      prefilledEmail,
    },
  };
};

export default function GetRealm({ prefilledEmail }: Props) {
  const { goToPage } = useNavigation();

  const onBack = () => {
    window.location.href = 'https://holium.com';
  };

  const onPurchaseId = () => {
    goToPage('/create-account', { email: prefilledEmail });
  };

  const onUploadId = () => {};

  return (
    <Page title="Get Realm">
      <GetRealmDialog
        onBack={onBack}
        onPurchaseId={onPurchaseId}
        onUploadId={onUploadId}
      />
    </Page>
  );
}
