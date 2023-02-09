/*
  @author:  lodlev-migdev
  @purpose: script that runs just before the windows build kicks off

*/
var fs = require('fs');
module.exports = ({ github, context }, workflowId, platform, ci) => {
  const pkgfile = './app/release/app/package.json';
  const pkg = JSON.parse(fs.readFileSync(pkgfile));
  pkg.version = ci.buildVersion;
  fs.writeFileSync(pkgfile, JSON.stringify(pkg, null, 2));

  // only on windows
  if (platform === 'windows') {
    const filename = './app/src/main/updater/app-update.yml';
    const lines = [
      `provider: generic`,
      `url: ${
        ['latest', 'hotfix'].indexOf(ci.channel) !== -1
          ? process.env.GH_PROXY
          : process.env.GH_PROXY_STAGING
      }`,
      `channel: ${ci.channel}`,
    ];
    fs.writeFileSync(filename, lines.join('\r\n'));
  }

  return ci;
};
