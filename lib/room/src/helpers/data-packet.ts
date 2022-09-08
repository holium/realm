import { Patp } from 'os/types';
import proto_min from 'protobufjs/minimal';
import { StatePayload, CursorPayload, Vec2 } from '@holium/realm-multiplayer';

function createBaseDataPacket(): DataPacket {
  return { kind: 0, value: undefined };
}

export interface DataPacket {
  kind: DataPacket_Kind;
  value?:
    | { $case: 'cursor'; data: CursorPayload }
    | { $case: 'state'; data: StatePayload };
}

export enum DataPacket_Kind {
  DATA = 0,
  UNRECOGNIZED = -1,
}

export interface CursorPacketType {
  event: string;
  id: string;
  position?: Vec2;
  target?: string;
}

function createBaseCursorPacket(): CursorPacketType {
  return { event: '', id: '', position: { x: 0, y: 0 }, target: '' };
}

export const CursorPacket = {
  encode(
    message: CursorPacketType,
    writer: proto_min.Writer = proto_min.Writer.create()
  ): proto_min.Writer {
    if (message.event === '') {
      writer.uint32(10).string(message.event);
    }
    if (message.id === '') {
      writer.uint32(10).string(message.id);
    }
    if (message.target === '') {
      writer.uint32(10).string(message.target);
    }
    if (message.position) {
      writer.uint32(24).string(JSON.stringify(message.position));
    }

    return writer;
  },
  decode(
    input: proto_min.Reader | Uint8Array,
    length?: number
  ): CursorPacketType {
    const reader =
      input instanceof proto_min.Reader ? input : new proto_min.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCursorPacket();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.event = reader.string();
          break;
        case 2:
          message.id = reader.string();
          break;
        case 3:
          message.position = JSON.parse(reader.string());
          break;
        case 4:
          message.id = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
};

export const DataPacket = {
  encode(
    message: DataPacket,
    writer: proto_min.Writer = proto_min.Writer.create()
  ): proto_min.Writer {
    if (message.kind !== 0) {
      writer.uint32(8).int32(message.kind);
    }
    if (message.value?.$case === 'cursor') {
      CursorPacket.encode(
        message.value.data,
        writer.uint32(18).fork()
      ).ldelim();
    }

    return writer;
  },

  decode(input: proto_min.Reader | Uint8Array, length?: number): DataPacket {
    const reader =
      input instanceof proto_min.Reader ? input : new proto_min.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDataPacket();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.kind = reader.int32() as any;
          break;
        case 2:
          message.value = {
            $case: 'cursor',
            data: CursorPacket.decode(reader, reader.uint32()),
          };
          break;
        // case 3:
        //   message.value = {
        //     $case: 'state',
        //     data: StatePacket.decode(reader, reader.uint32()),
        //   };
        //   break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
};
