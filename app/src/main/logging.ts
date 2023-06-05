import { app, session } from 'electron';
import log from 'electron-log';
import { ElectronBlocker } from '@cliqz/adblocker-electron';
import fs from 'fs';
import path from 'path';

import { isDevelopment, isProduction } from './helpers/env';

// TODO test this
log.create('main');
log.catchErrors();
log.transports.file.level = 'info';
log.transports.file.resolvePath = () =>
  path.join(app.getPath('userData'), 'main.log');

ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
  blocker.enableBlockingInSession(session.fromPartition('browser-webview'));
});

process.on('uncaughtException', (err) => {
  try {
    fs.appendFileSync('realmlog.txt', err.stack || err.message);
  } catch (e) {
    console.log(e);
  }
});

if (isProduction) {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (isDevelopment) require('electron-debug')();
