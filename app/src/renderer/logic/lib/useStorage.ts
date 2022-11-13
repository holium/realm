import S3Client, { StorageClient, StorageAcl } from '../s3/S3Client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { ShipActions } from '../actions/ship';

// Pulled this from landscape

export interface IuseStorage {
  canUpload: boolean;
  upload: (file: File, bucket: string) => Promise<string>;
  uploadDefault: (file: File) => Promise<string>;
  uploading: boolean;
  promptUpload: (
    elem: HTMLElement,
    onError?: (err: Error) => void
  ) => Promise<string>;
}

const useStorage = ({ accept = '*' } = { accept: '*' }): IuseStorage => {
  const [uploading, setUploading] = useState(false);
  const [s3, setS3] = useState<any>();

  useEffect(() => {
    if (!s3) {
      ShipActions.getS3Bucket().then((response: any) => {
        console.log(response);
        setS3(response);
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
    client.current = new S3Client({
      credentials: s3.credentials,
      endpoint: s3.credentials.endpoint,
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
      return upload(file, s3.configuration.currentBucket);
    },
    [s3, upload]
  );

  const promptUpload = useCallback(
    (elem: HTMLElement, onError?: (err: Error) => void): Promise<string> => {
      return new Promise((resolve, reject) => {
        const fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.setAttribute('accept', accept);
        fileSelector.style.visibility = 'hidden';
        fileSelector.addEventListener('change', () => {
          const files = fileSelector.files;
          if (!files || files.length <= 0) {
            reject();
          } else if (onError) {
            uploadDefault(files[0])
              .then(resolve)
              .catch((err) => onError(err));
            elem.removeChild(fileSelector);
          } else {
            uploadDefault(files[0]).then(resolve);
            elem.removeChild(fileSelector);
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

export default useStorage;
