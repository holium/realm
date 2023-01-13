/*
  @author:  lodlev-migdev
  @purpose: script that runs after the build is finished

*/
var fs = require('fs');
module.exports = ({ github, context }, ci, pkgfile) => {
  const pkg = JSON.parse(fs.readFileSync(pkgfile));
  // see: https://www.electron.build/tutorials/release-using-channels.html
  pkg.version = ci.packageVersion;
  fs.writeFileSync(pkgfile, JSON.stringify(pkg, null, 2));
  return ci;
};
