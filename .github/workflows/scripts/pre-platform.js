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
  return ci;
};
