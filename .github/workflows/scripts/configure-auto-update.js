const fs = require('fs');
module.exports = ({ github, context }, workflowId, platform, ci) => {
  const env = JSON.parse(process.env.CI_ENV);
  const filename = './app/src/main/updater/app-update.yml';
  const lines = [
    `provider: generic`,
    `url: ${
      ['latest', 'hotfix'].indexOf(env.channel) !== -1
        ? 'https://ghproxy.holium.xyz'
        : 'https://ghproxy-staging.holium.xyz'
    }`,
    `channel: ${env.channel}`,
  ];
  fs.writeFileSync(filename, lines.join('\r\n'));
};
