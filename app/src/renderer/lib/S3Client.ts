import { S3, S3ClientConfig } from '@aws-sdk/client-s3';
// pulled this from landscape
export enum StorageAcl {
  PublicRead = 'public-read',
}

export interface UploadParams {
  Bucket: string; // the bucket to upload the object to
  Key: string; // the desired location within the bucket
  ContentType: string; // the object's mime-type
  ACL: StorageAcl; // ACL, always 'public-read'
  Body: File | Buffer; // the object itself
}
export interface DeleteParams {
  Bucket: string; // the bucket to upload the object to
  Key: string; // the desired location within the bucket
}
export interface UploadResult {
  Location: string;
}

// Extra layer of indirection used by S3 client.
export interface StorageUpload {
  promise: () => Promise<any>;
}

export interface StorageClient {
  upload: (params: UploadParams) => StorageUpload;
}

export class S3Client implements StorageClient {
  config: S3ClientConfig;
  client: S3 | null = null;

  constructor(config: S3ClientConfig) {
    this.config = config;
  }

  async initAndUpload(params: UploadParams) {
    if (!this.client) {
      this.client = new S3(this.config);
    }

    return await this.client.putObject(params);
  }

  upload(params: UploadParams): StorageUpload {
    const upload = this.initAndUpload.bind(this);
    return {
      promise: async () => await upload(params),
    };
  }

  async initAndDelete(params: DeleteParams) {
    if (!this.client) {
      this.client = new S3(this.config);
    }

    return await this.client.deleteObject(params);
  }

  delete(params: DeleteParams): StorageUpload {
    const deleteCall = this.initAndDelete.bind(this);
    return {
      promise: async () => await deleteCall(params),
    };
  }
}
