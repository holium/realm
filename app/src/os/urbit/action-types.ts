import { GallAgent, Path } from './types';

export interface SendAction {
  /** {@inheritDoc GallAgent} */
  app: GallAgent;
  /** {@inheritDoc Path} */
  path: Path;
  body: {
    action: string;
    resource: string;
    context?: {
      [key: string]: string;
    };
    data?: any;
  };
}
