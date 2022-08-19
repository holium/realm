import { Patp } from 'os/types';
import { MutableRefObject } from 'react';
import { ConnectionState, Participant } from '.';

export class RemoteParticipant extends Participant {
  peerConn: RTCPeerConnection;
  waitInterval?: number;
  constructor(patp: Patp, config: RTCConfiguration) {
    super(patp);
    this.peerConn = new RTCPeerConnection();
    this.peerConn.setConfiguration(config);

    const sendAwaitingOffer = async () => {
      this.connectionState !== ConnectionState.Connected &&
        this.sendSignal(this.patp, 'awaiting-offer', '');
    };

    // @ts-ignore
    this.waitInterval = setInterval(sendAwaitingOffer, 5000);

    this.peerConn.addEventListener('connectionstatechange', (event) => {
      if (this.connectionState === ConnectionState.Connected) {
        console.log('peers connected!');
      }
    });

    this.peerConn.addEventListener('icecandidate', (e) => {
      if (e.candidate === null) return;
      // appendIceCandidate(can);
      // var data = JSON.stringify({'ice-candidate': can});
      // pokeslipData([peer], data);
      let can = JSON.stringify(e.candidate!.toJSON());
      this.sendSignal(this.patp, 'ice-candidate', can);
    });

    this.peerConn.onicegatheringstatechange = (event: Event) => {
      if (!event) return;
      if (!event.target) return;
      if (!(event.target instanceof RTCPeerConnection)) return;
      let connection: RTCPeerConnection = event.target;
      switch (connection.iceGatheringState!) {
        case 'gathering':
          /* collection of candidates has begun */
          console.log('gathering');
          break;
        case 'complete':
          /* collection of candidates is finished */
          console.log('complete');
          // clearInterval(this.waitInterval);
          // console.log(candidates);
          // // sendCandidates();
          // var data = JSON.stringify({'ice-candidates': candidates});
          // pokeslipData([peer], data);
          break;
      }
    };
    this.peerConn.addEventListener('negotiationneeded', async (e) => {
      console.log('negneeded');
    });
  }

  async registerAudio(audioRef: HTMLAudioElement) {
    // const offer = await this.peerConn.createOffer({
    //   offerToReceiveAudio: true,
    //   offerToReceiveVideo: true,
    // });
    // await this.peerConn.setLocalDescription(offer);
    // console.log(this.peerConn.localDescription);
    // this.sendSignal(this.patp, 'offer', this.peerConn.localDescription);
    // // this.peerConn.addEventListener('track', (e: RTCTrackEvent) => {
    //   // TODO Assume only one track for now
    //   console.log('tracking shit');
    //   audioRef.srcObject = remoteStream;
    // });
    // //

    this.peerConn.addEventListener('track', async (event) => {
      const [remoteStream] = event.streams;
      console.log('got remote stream');
      audioRef.setAttribute('id', `voice-stream-${this.patp}`);
      audioRef.setAttribute('autoPlay', '');
      audioRef.srcObject = remoteStream;
      this.connectionState = ConnectionState.Connected;
    });
  }

  async handleSlip(slipData: any, ourPatpId: number) {
    const isOfferer = ourPatpId < this.patpId;
    console.log('handle slip', this.patpId, ourPatpId);

    if (!isOfferer) {
      console.log('we be hittin that fool with awaitings');
    }

    //   await this.peerConn.setRemoteDescription(slipDataData['answer']);
    if (slipData['awaiting-offer'] !== undefined) {
      console.log('awaiting-offer');
      console.log(
        'we are sending the initial offer',
        this.peerConn.connectionState
      );
      if (!isOfferer) return;
      if (this.peerConn.connectionState !== 'new') return;
      const offer = await this.peerConn.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.peerConn.setLocalDescription(offer);
      // var offerslipData = JSON.stringify({'offer': btoa(this.peerConn.localDescription?.toJSON().toString())});
      // console.log(offerslipData);
      // pokeslipData([peer], offerslipData);
      this.sendSignal(this.patp, 'offer', this.peerConn.localDescription);
    } else if (slipData['ice-candidate']) {
      console.log('ice-candidate');
      let iceCand = JSON.parse(slipData['ice-candidate']);
      console.log(iceCand);
      await this.peerConn.addIceCandidate({
        candidate: iceCand.candidate,
        sdpMid: iceCand.sdpMid,
        sdpMLineIndex: iceCand.sdpMLineIndex,
      });
      console.log('ice candidate!');
    } else if (slipData['offer']) {
      console.log('offer');
      console.log('jhjsjjjsddjsjddsjsdjsdj', slipData['offer']);
      this.waitInterval;
      // the caller does not receive offers
      if (isOfferer) return;
      console.log(
        'we are clearing the interval, processing the offer, and sending the answer'
      );
      clearInterval(this.waitInterval);

      console.log('offer', slipData['offer']);
      await this.peerConn.setRemoteDescription(slipData['offer']);

      const answer = await this.peerConn.createAnswer();
      await this.peerConn.setLocalDescription(answer);

      this.sendSignal(this.patp, 'answer', this.peerConn.localDescription);
    } else if (slipData['answer']) {
      console.log('answer');
      // only the caller receives answers
      console.log('answer', slipData['answer']);
      this.waitInterval = undefined;
      if (!isOfferer) {
        console.log('answer rejected!?');

        return;
      }
      await this.peerConn.setRemoteDescription(slipData['answer']);
    }
  }
}
