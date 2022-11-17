// import { RoomInstance } from './../RoomInstance';
// import { Patp, RoomType } from '../types';
// import { BaseProtocol } from './BaseProtocol';
// import { RemotePeer } from '../peer/RemotePeer';
// import { LocalPeer } from '../peer/LocalPeer';

// export type TestSession = {
//   patp: string;
//   host?: boolean;
// };

// const peerConnectionConfig: RTCConfiguration = {
//   iceServers: [{ urls: ['stun:coturn.holium.live:3478'] }],
//   iceTransportPolicy: 'relay',
// };

// export class RoomProtocol extends BaseProtocol {
//   private cookie?: string;

//   constructor(our: Patp) {
//     super(our);
//   }
//   registerLocal(our: Patp) {
//     this.local = new LocalPeer(
//       our,
//       {
//         isHost: false,
//         rtc: peerConnectionConfig,
//       },
//       (data: any) => {
//         // this.signaling.postMessage(data);
//       }
//     );
//   }
//   /**
//    * Sets the provider in room agent
//    *
//    * @param provider
//    * @returns string
//    */
//   async setProvider(provider: Patp): Promise<RoomType[]> {
//     // return provider;
//     return [];
//   }

//   async getRooms(): Promise<RoomType[]> {
//     return [];
//   }

//   // async getRoom(rid:string): Promise<RoomType> {
//   //   return {};
//   // }

//   async connect(room: RoomType) {
//     // this.cookie = await browser.cookies.get(`urbauth-${this.our}`);
//   }

//   joined(peer: Patp) {
//     return;
//   }

//   dial(peer: Patp): RemotePeer {
//     return null;
//   }

//   hangup(peer: Patp) {
//     return;
//   }

//   reconnect(peer: Patp) {
//     return;
//   }

//   kick(peer: Patp) {
//     return;
//   }

//   leave() {
//     return;
//   }
// }
