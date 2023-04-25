import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { ShipIPC } from 'renderer/stores/ipc';

import { S3Client, StorageAcl, StorageClient } from './S3Client';

// Pulled this from landscape

export interface IuseStorage {
  canUpload: boolean;
  upload: (file: File, bucket: string) => Promise<string>;
  uploadDefault: (file: File) => Promise<string>;
  uploading: boolean;
  promptUpload: (elem: HTMLElement) => Promise<File>;
}

export const useStorage = ({ accept = '*' } = { accept: '*' }): IuseStorage => {
  const [uploading, setUploading] = useState(false);
  const [s3, setS3] = useState<any>();

  useEffect(() => {
    if (!s3) {
      (ShipIPC.getS3Bucket() as Promise<any>)
        .then((response: any) => {
          setS3(response);
        })
        .catch((err: any) => {
          console.error(err);
        });
    }
  }, [s3]);

  const client = useRef<StorageClient | null>(null);

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
    // a little shim to handle people who accidentally included their bucket at the front of the credentials.endpoint
    let endp = s3.credentials.endpoint;
    if (endp.split('.')[0] === s3.configuration.currentBucket) {
      endp = endp.split('.').slice(1).join('.');
    }
    client.current = new S3Client({
      credentials: s3.credentials,
      endpoint: endp,
      signatureVersion: 'v4',
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
    async (file: File, bucket: string): Promise<string> => {
      if (client.current === null) {
        throw new Error('Storage not ready');
      }

      const fileParts = file.name.split('.');
      const fileName = fileParts.slice(0, -1);
      const fileExtension = fileParts.pop();

      const params = {
        Bucket: bucket,
        Key: `${window.ship}/${moment().unix()}-${fileName}.${fileExtension}`,
        Body: file,
        ACL: StorageAcl.PublicRead,
        ContentType: file.type,
      };

      setUploading(true);

      const { Location } = await client.current.upload(params).promise();

      setUploading(false);

      return Location;
    },
    [client, setUploading]
  );

  const uploadDefault = useCallback(
    async (file: File): Promise<string> => {
      if (s3.configuration.currentBucket === '') {
        throw new Error('current bucket not set');
      }
      return await upload(file, s3.configuration.currentBucket);
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

  return { canUpload, upload, uploadDefault, uploading, promptUpload };
};
