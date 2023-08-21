import { useState } from 'react';

import { Flex } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import { AccountDialog } from '../../components/AccountDialog';
import {
  FUNDING_OPTIONS,
  FundingOption,
  FundingOptions,
} from '../../components/FundingOptions';
import { Modal } from '../../components/Modal';
import { OnboardDialogTitleBig } from '../../components/OnboardDialog.styles';
import { PayWithEthButton } from '../../components/PayWithEthButton';
import { SidebarSection } from '../../onboarding';
import { ThirdEarthShip } from '../../types';
import {
  AccountCryptoPaymentBody,
  CryptoPayment,
} from './AccountCryptoPaymentBody';

type Props = {
  ships: ThirdEarthShip[];
  selectedShipId: number | undefined;
  paymentHistory: CryptoPayment[];
  setSelectedShipId: (newId: number) => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onClickPurchaseId: () => void;
  onClickUploadId: () => void;
  onClickPay: () => void;
  onClickExit: () => void;
};

export const AccountCryptoPaymentDialog = ({
  ships,
  selectedShipId,
  paymentHistory,
  setSelectedShipId,
  onClickSidebarSection,
  onClickPurchaseId,
  onClickUploadId,
  onClickPay,
  onClickExit,
}: Props) => {
  const payModal = useToggle(false);

  const [fundingOption, setFundingOption] = useState<FundingOption>(
    FUNDING_OPTIONS[0]
  );

  const handleOnClickPay = () => {
    onClickPay();
    payModal.toggleOff();
  };

  return (
    <>
      <Modal isOpen={payModal.isOn} onDismiss={payModal.toggleOff}>
        <Flex flexDirection="column" gap="24px">
          <OnboardDialogTitleBig>Pay</OnboardDialogTitleBig>
          <FundingOptions
            fundingOption={fundingOption}
            setFundingOption={setFundingOption}
          />
          <PayWithEthButton
            ethPrice={fundingOption.ethPrice}
            onClick={handleOnClickPay}
          />
        </Flex>
      </Modal>
      <AccountDialog
        ships={ships}
        selectedShipId={selectedShipId}
        setSelectedShipId={setSelectedShipId}
        currentSection={SidebarSection.CryptoPayment}
        onClickPurchaseId={onClickPurchaseId}
        onClickUploadId={onClickUploadId}
        onClickSidebarSection={onClickSidebarSection}
        onExit={onClickExit}
      >
        <AccountCryptoPaymentBody
          key={selectedShipId}
          serviceStartDate="07/18/23 06:56 AM UTC"
          ethAddress="0xAC36fc83EB0B09ACd3244AD6637A8e8404724D6c"
          balance="0.00 ETH"
          due="0.0080 ETH by 08/16/23"
          paymentHistory={paymentHistory}
          onClickPay={payModal.toggleOn}
        />
      </AccountDialog>
    </>
  );
};
