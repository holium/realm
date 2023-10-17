import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';

import { S3CredentialsAndConfig } from 'os/services/ship/ship.service';
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
  const [s3, setS3] = useState<S3CredentialsAndConfig>();

  const getAndSetS3 = async () => {
    const fetched = await ShipIPC.getS3Bucket();
    if (fetched) setS3(fetched);
  };

  useEffect(() => {
    if (!s3) getAndSetS3();
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
    client.current = new S3Client({
      credentials: s3.credentials,
      region: s3.configuration.region,
    });
  }, [s3]);

  const canUpload = useMemo(() => {
    if (!s3) return false;
    return Boolean(
      s3.credentials &&
        s3.credentials.accessKeyId &&
        s3.credentials.secretAccessKey &&
        s3.configuration.currentBucket !== ''
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

      const key = encodeURI(
        `${window.ship}/${moment().unix()}-${fileName}.${fileExtension}`
      );
      const params = {
        Bucket: bucket,
        Key: key,
        Body: file,
        ACL: StorageAcl.PublicRead,
        ContentType: file.type,
      };

      setUploading(true);

      const uploadResponse = await client.current.upload(params).promise();
      if (s3 && uploadResponse['$metadata'].httpStatusCode === 200) {
        // a little shim to handle people who accidentally included their bucket at the front of the credentials.endpoint
        let endp = s3.credentials.endpoint;
        if (endp.split('.')[0] === s3.configuration.currentBucket) {
          endp = endp.split('.').slice(1).join('.');
        }

        setUploading(false);
        return `https://${endp}/${params.Bucket}/${key}`;
      } else {
        throw new Error();
      }
    },
    [client, setUploading]
  );

  const uploadDefault = useCallback(
    async (file: File): Promise<string> => {
      if (!s3 || s3.configuration.currentBucket === '') {
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
