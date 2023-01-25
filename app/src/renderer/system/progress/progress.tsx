import { createRoot } from 'react-dom/client';
import { UpdateProgressView } from './components/progress';

const environment = process.env.NODE_ENV;
const isProd = environment === 'production';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<UpdateProgressView></UpdateProgressView>);
// root.render(<>hi</>);
