import type S3 from 'aws-sdk/clients/s3';
// pulled this from landscape
export enum StorageAcl {
  PublicRead = 'public-read',
}

export interface UploadParams {
  Bucket: string; // the bucket to upload the object to
  Key: string; // the desired location within the bucket
  ContentType: string; // the object's mime-type
  ACL: StorageAcl; // ACL, always 'public-read'
  Body: File; // the object itself
}

export interface UploadResult {
  Location: string;
}

// Extra layer of indirection used by S3 client.
export interface StorageUpload {
  promise: () => Promise<UploadResult>;
}

export interface StorageClient {
  upload: (params: UploadParams) => StorageUpload;
}

export class S3Client implements StorageClient {
  config: S3.ClientConfiguration;
  client: S3 | null = null;
  S3!: typeof import('aws-sdk/clients/s3');

  constructor(config: S3.ClientConfiguration) {
    this.config = config;
  }

  async initAndUpload(params: UploadParams) {
    if (!this.S3) {
      await this.loadLib();
    }

    if (!this.client) {
      this.client = new this.S3(this.config);
    }

    return await this.client.upload(params).promise();
  }

  upload(params: UploadParams): StorageUpload {
    const upload = this.initAndUpload.bind(this);
    return {
      promise: async () => await upload(params),
    };
  }

  async loadLib() {
    this.S3 = (await import('aws-sdk/clients/s3')).default;
  }
}
