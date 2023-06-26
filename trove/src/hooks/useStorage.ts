//import S3 , { StorageClient, StorageAcl } from "../s3/S3 ";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeleteObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';

import { log } from '../helpers';
import useTroveStore, { TroveStore } from '../store/troveStore';

interface FileMetadata {
  title: string;
  size: string;
  extension: string;
  timeUploaded: number;
  url: string;
  key: string;
}
// Pulled this from landscape

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
export interface IuseStorage {
  canUpload: boolean;
  upload: (file: File, metadata: any, bucket: string) => Promise<any>;
  uploadDefault: (file: File, metadata: any) => Promise<any>;
  uploading: boolean;
  promptUpload: (elem: HTMLElement) => Promise<File>;
  deleteFile: (key: string) => Promise<any>;
}

function formatEndpoint(endpoint: string): string {
  if (!endpoint.startsWith('https://')) {
    return 'https://' + endpoint;
  }
  return endpoint;
}
const useStorage = ({ accept = '*' } = { accept: '*' }): IuseStorage => {
  const [uploading, setUploading] = useState(false);
  const [s3, setS3] = useState<any>();
  const shipName = useTroveStore((store: TroveStore) => store.shipName);
  const api = useTroveStore((store: TroveStore) => store.api);

  useEffect(() => {
    if (!s3) {
      getS3();
    }
  }, [s3]);
  const getS3 = async () => {
    //we have to get both creds and config
    try {
      const credentials = await api.getS3credentials();
      const configuration = await api.getS3Configuration();
      log('configuration', configuration);
      log('credentials', credentials);
      const newS3 = {
        ...credentials['s3-update'],
        ...configuration['s3-update'],
      };
      setS3(newS3);
    } catch (e) {
      console.log('error get s3', e);
    }
  };
  const client = useRef<any | null>(null);
  useEffect(() => {
    // prefer GCP if available, else use S3.
    // XX ships currently always have S3 credentials, but the fields are all
    // set to '' if they are not configured.
    if (!s3) return;
    if (
      !s3.credentials ||
      !s3.credentials.accessKeyId ||
      !s3.credentials.secretAccessKey
    ) {
      return;
    }
    client.current = new S3({
      //forcePathStyle: false,
      credentials: s3.credentials,
      endpoint: formatEndpoint(s3.credentials.endpoint),
      //signatureVersion: "v4",
      region: s3.configuration.region ? s3.configuration.region : 'global',
    });
  }, [s3]);
  const canUpload = useMemo(() => {
    if (!s3) return;
    return (
      (s3.credentials &&
        s3.credentials.accessKeyId &&
        s3.credentials.secretAccessKey &&
        s3.configuration.currentBucket !== '') ||
      false
    );
  }, [s3]);

  const upload = useCallback(
    async (file: File, metadata: any, bucket: string): Promise<any> => {
      if (client.current === null) {
        throw Error('Storage not ready');
      }

      const key = `${shipName}/${metadata.timeUploaded}-${metadata.title}.${metadata.extension}`;
      const params = {
        Bucket: bucket,
        Key: key,
        Body: file,
        ACL: StorageAcl.PublicRead,
        ContentType: file.type,
      };

      setUploading(true);
      try {
        const command = new PutObjectCommand(params);
        await client.current.send(command);
        //set the metadata of the file we just uploaded here
        const metaData: FileMetadata = {
          ...metadata,
          url: buildURI(key, bucket),
          key,
        };
        setUploading(false);
        return metaData;
      } catch (e) {
        throw Error(
          'something went wrong with uploading to S3, check the configuration on your ship'
        );
      }
    },
    [s3, client, setUploading]
  );
  const buildURI = (key: any, bucket: any) => {
    const uri =
      formatEndpoint(s3.credentials.endpoint) + '/' + bucket + '/' + key;
    return uri;
  };
  const deleteFile = useCallback(
    async function (key: string): Promise<any> {
      log('s3 ', s3);

      // Specifies a path within your bucket and the file to delete.
      const bucketParams = {
        Bucket: s3.configuration.currentBucket,
        Key: key,
      };
      const command = new DeleteObjectCommand(bucketParams);
      try {
        const data = await client.current.send(command).promise;
        console.log('Success', data);
        return data;
      } catch (err) {
        console.log('Error', err);
      }
    },
    [s3, client, setUploading]
  );

  const uploadDefault = useCallback(
    async (file: File, metadata: any): Promise<string> => {
      if (s3.configuration.currentBucket === '') {
        throw new Error('current bucket not set');
      }
      return await upload(file, metadata, s3.configuration.currentBucket);
    },
    [s3, upload]
  );

  const promptUpload = useCallback(
    async (elem: HTMLElement): Promise<File> => {
      return await new Promise((resolve, reject) => {
        const fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.setAttribute('accept', accept);
        fileSelector.style.visibility = 'hidden';
        fileSelector.addEventListener('change', () => {
          const files = fileSelector.files;
          if (!files || files.length <= 0) {
            reject();
          } else {
            elem.removeChild(fileSelector);
            resolve(files[0]);
          }
        });
        elem.appendChild(fileSelector);
        fileSelector.click();
      });
    },
    [uploadDefault]
  );

  return {
    canUpload,
    upload,
    uploadDefault,
    uploading,
    promptUpload,
    deleteFile,
  };
};

export default useStorage;
