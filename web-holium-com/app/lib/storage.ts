import { S3, S3Client } from '@aws-sdk/client-s3';
import { shipUrl } from './shared';

export enum StorageAcl {
  PublicRead = 'public-read',
}

export type S3CredentialsAndConfig = {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
  };
  configuration: {
    currentBucket: string;
    region: string;
  };
};

export const uploadDataURL = (
  filename: string,
  dataUrl: string
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    // const s3Client = new S3Client(/*{ region: 'us-west-2' }*/);
    const response = await getStorageConfig();
    if (response === null) {
      reject('s3 config failure');
      return;
    }
    const { credentials, configuration } = response;
    // a little shim to handle people who accidentally included their bucket at the front of the credentials.endpoint
    let endp = credentials.endpoint;
    if (endp.split('.')[0] === configuration.currentBucket) {
      endp = endp.split('.').slice(1).join('.');
    }

    endp = endp.replace('https://', '');

    console.log('args: %o', {
      endpoint: credentials.endpoint.includes('https://')
        ? credentials.endpoint
        : configuration.region === ''
        ? `https://${endp}`
        : undefined,
      credentials: credentials,
      region: configuration.region === '' ? 'us-east-1' : configuration.region,
    });

    const client = new S3({
      endpoint: credentials.endpoint.includes('https://')
        ? credentials.endpoint
        : configuration.region === ''
        ? `https://${endp}`
        : undefined,
      credentials: credentials,
      region: configuration.region === '' ? 'us-east-1' : configuration.region,
    });

    let parts = dataUrl.split(',');
    if (parts.length !== 2) {
      reject('malformed data url (content not found)');
      return;
    }

    const content = parts[1];

    parts = parts[0].split(';');
    if (parts.length !== 2) {
      reject('malformed data url (encoding not found)');
      return;
    }

    if (parts[1] !== 'base64') {
      reject('malformed data url (base64 support only)');
      return;
    }

    parts = parts[0].split(':');
    if (parts.length !== 2) {
      reject('malformed data url (content type not found)');
      return;
    }

    const contentType = parts[1];

    const fileContent = Buffer.from(content, 'base64');

    const params = {
      Bucket: configuration.currentBucket,
      Key: filename,
      Body: fileContent as Buffer,
      ACL: StorageAcl.PublicRead,
      ContentType: contentType,
    };

    console.log('params: %o', params);

    const uploadResponse = await client.putObject(params);
    if (uploadResponse['$metadata'].httpStatusCode === 200) {
      const Location = `https://${endp}/${params.Bucket}/${filename}`;
      resolve(Location);
    } else {
      reject('storage upload failed');
    }
  });
};

export const getStorageConfig =
  async (): Promise<S3CredentialsAndConfig | null> => {
    let result = null;
    try {
      const credentialsResponse = await fetch(
        `/~/scry/api-store/credentials.json`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const credentials = await credentialsResponse.json();

      const configurationResponse = await fetch(
        `/~/scry/api-store/configuration.json`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const configuration = await configurationResponse.json();

      result = { credentials, configuration };
    } catch (e) {
      console.error(e);
    }
    return result;
  };

export const savePassportOpenGraphImage = async (imageUrl: string) => {
  // attempt to post payload to ship
  const response = await fetch(
    `/spider/realm/profile-action/profile-vent/profile-vent`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        'save-opengraph-image': {
          img: imageUrl,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.json();
};
