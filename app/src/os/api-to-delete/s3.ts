import { Conduit } from '@holium/conduit';

export const S3Api = {
  getCredentials: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 's3-store',
      path: `/credentials`,
    });
    return response['s3-update'];
  },
  getConfiguration: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 's3-store',
      path: `/configuration`,
    });
    return response['s3-update'];
  },
};
