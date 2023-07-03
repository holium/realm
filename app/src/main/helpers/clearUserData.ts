import { app } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import { rimrafSync } from 'rimraf';

/**
 * Clears the cache for the current user.
 * Used so new versions of the app can be tested without interference from
 * previous versions.
 *
 * On Mac, cache is stored in ~/Library/Application Support/@holium
 * On Windows, cache is stored in %APPDATA%/@holium
 * On Linux, cache is stored in ~/.config/@holium
 */
export const clearUserData = () => {
  const userDataPath = app.getPath('userData');

  if (fs.existsSync(userDataPath)) {
    log.info('Clearing user data:', userDataPath);
    rimrafSync(userDataPath);
  }
};
