import { SlipService } from 'os/services/slip.service';

type SlipActionType = typeof SlipService.preload;
export const SlipActions: SlipActionType = window.electron.os.slip;
