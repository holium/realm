import { app } from 'electron';
const fs = require('fs');

// determine the releaseChannel. if a user downloads an alpha version of the app, we
//  need to record this for later use. the reason is that 'alpha' channel updates
//  both when new alpha and release builds are deployed.
//  since release builds will not have process.env.RELEASE_CHANNEL (which means)
//   channel will be set to 'latest', we need to "remember" that this is still
//   an 'alpha' channel user. the rule is:
//  once an 'alpha' user, always an 'alpha' user unless you remove/edit the settings.json file

export function getReleaseChannel() {
  let releaseChannel = process.env.RELEASE_CHANNEL || 'latest';
  const settingsFilename = `${app.getPath('userData')}/settings.json`;
  if (fs.existsSync(settingsFilename)) {
    var settings = JSON.parse(fs.readFileSync(settingsFilename, 'utf8'));
    releaseChannel = settings.releaseChannel || releaseChannel;
  }
  return releaseChannel;
}

export function setReleaseChannel(channel: string) {
  const settingsFilename = `${app.getPath('userData')}/settings.json`;
  fs.writeFileSync(
    settingsFilename,
    JSON.stringify({ releaseChannel: channel })
  );
}
