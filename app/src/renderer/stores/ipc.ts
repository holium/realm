// Sets up the IPC interface for the renderer process
export const MainIPC = window.electron.app;
export const RealmIPC = window.realm;
export const AuthIPC = window.authService;
export const OnboardingIPC = window.onboardingService;
export const ShipIPC = window.shipService;
export const ChatIPC = window.chatService;
export const WalletIPC = window.walletService;
export const NotifIPC = window.notifService;
export const FriendsIPC = window.friendDb;
export const SpacesIPC = window.spacesService;
export const BazaarIPC = window.bazaarService;
export const AppInstallIPC = window.appInstallService;
export const AppRecentsIPC = window.appRecentsService;
export const SettingsIPC = window.settingsService;
export const NotesIPC = window.notesService;
export const LexiconIPC = window.lexiconService;
export const TroveIPC = window.troveService;
