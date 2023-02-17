import { AirliftService } from 'os/services/shell/airlift.service';

/**
 * AirliftActions for interfacing with core process
 */
type AirliftActionType = typeof AirliftService.preload;
export const AirliftActions: AirliftActionType = window.electron.os.airlift;
