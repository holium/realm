// Sets up the IPC interface for the renderer process
export const MainIPC = window.electron.app;
export const RealmIPC = window.realm;
export const AuthIPC = window.authService;
export const ShipIPC = window.shipService;
export const RoomsIPC = window.roomsService;
export const ChatIPC = window.chatService;
export const WalletIPC = window.walletService;
export const NotifIPC = window.notifService;
export const FriendsIPC = window.friendDb;
export const SpacesIPC = window.spacesService;
export const BazaarIPC = window.bazaarService;
