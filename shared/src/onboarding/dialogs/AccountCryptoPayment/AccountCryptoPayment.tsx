import { AccountDialog, SidebarSection } from '../../components/AccountDialog';
import { ThirdEarthShip } from '../../types';
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

export const AccountCryptoPayment = ({
  ships,
  selectedShipId,
  setSelectedShipId,
  onClickSidebarSection,
  onClickPurchaseId,
  onClickUploadId,
  onClickPay,
  onClickExit,
}: Props) => (
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
    <AccountCryptoPaymentBody key={selectedShipId} onClickPay={onClickPay} />
  </AccountDialog>
);
