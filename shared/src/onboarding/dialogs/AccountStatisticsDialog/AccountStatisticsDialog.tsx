import { AccountDialog, SidebarSection } from '../../components/AccountDialog';
import { OnboardDialogTitle } from '../../components/OnboardDialog.styles';

type Props = {
  patps: string[];
  selectedPatp: string;
  setSelectedPatp: (patp: string) => void;
  onClickBuyServer: () => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountStatisticsDialog = ({
  patps,
  selectedPatp,
  setSelectedPatp,
  onClickBuyServer,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    patps={patps}
    selectedPatp={selectedPatp}
    setSelectedPatp={setSelectedPatp}
    currentSection={SidebarSection.Statistics}
    onClickBuyServer={onClickBuyServer}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  >
    <OnboardDialogTitle>Coming soon...</OnboardDialogTitle>
  </AccountDialog>
);
