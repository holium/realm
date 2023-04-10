import { AccountDialog, SidebarSection } from '../components/AccountDialog';
import { OnboardDialogTitle } from '../components/OnboardDialog.styles';

type Props = {
  patps: string[];
  selectedPatp: string;
  setSelectedPatp: (patp: string) => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountStatisticsDialog = ({
  patps,
  selectedPatp,
  setSelectedPatp,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    patps={patps}
    selectedPatp={selectedPatp}
    setSelectedPatp={setSelectedPatp}
    currentSection={SidebarSection.Statistics}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  >
    <OnboardDialogTitle>Coming soon...</OnboardDialogTitle>
  </AccountDialog>
);
