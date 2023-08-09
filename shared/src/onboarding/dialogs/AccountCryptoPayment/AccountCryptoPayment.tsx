import { useState } from 'react';

import { Flex, Text } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import { AccountDialog, SidebarSection } from '../../components/AccountDialog';
import { FundingCard } from '../../components/FundingCard';
import { Modal } from '../../components/Modal';
import { OnboardDialogTitleBig } from '../../components/OnboardDialog.styles';
import { ThirdEarthShip } from '../../types';
import { PayButton } from '../FundAccount/FundAccountDialogBody';
import { AccountCryptoPaymentBody } from './AccountCryptoPaymentBody';

type Props = {
  ships: ThirdEarthShip[];
  selectedShipId: number | undefined;
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
  setSelectedShipId,
  onClickSidebarSection,
  onClickPurchaseId,
  onClickUploadId,
  onClickPay,
  onClickExit,
}: Props) => {
  const payModal = useToggle(false);
  const [fundingOption, setFundingOption] = useState(0);

  const getAmount = (option: number) => {
    switch (option) {
      case 0:
        return '0.0080 ETH';
      case 1:
        return '0.080 ETH';
      case 2:
        return '2.125 ETH';
      default:
        return '0.0080 ETH';
    }
  };

  const handleOnClickPay = () => {
    onClickPay();
    payModal.toggleOff();
  };

  return (
    <>
      <Modal
        isOpen={payModal.isOn}
        onDismiss={payModal.toggleOff}
        onSubmit={handleOnClickPay}
      >
        <Flex flexDirection="column" gap="24px">
          <OnboardDialogTitleBig>Pay</OnboardDialogTitleBig>
          <Flex flexDirection="column" gap="8px">
            <FundingCard
              label="One month"
              ethPrice={getAmount(0)}
              usdPrice="$15.00 USD"
              isSelected={fundingOption === 0}
              onClick={() => setFundingOption(0)}
            />
            <FundingCard
              label="One year"
              ethPrice={getAmount(1)}
              usdPrice="$150.00 USD"
              isSelected={fundingOption === 1}
              onClick={() => setFundingOption(1)}
            />
            <FundingCard
              label="Lifetime"
              ethPrice={getAmount(2)}
              usdPrice="$4,000.00 USD"
              isSelected={fundingOption === 2}
              onClick={() => setFundingOption(2)}
            />
          </Flex>
          <PayButton width="100%" onClick={handleOnClickPay}>
            <Text.Body
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255)',
              }}
            >
              Pay
            </Text.Body>
            <Text.Body
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.70)',
              }}
            >
              {getAmount(fundingOption)}
            </Text.Body>
          </PayButton>
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
          paymentHistory={[]}
          onClickPay={payModal.toggleOn}
        />
      </AccountDialog>
    </>
  );
};
