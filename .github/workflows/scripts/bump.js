/*
  @author:  lodlev-migdev
  @purpose: bump the version of each desks in the desks array based on the
     version indicated by the ./app/release/app/package.json file (official Realm build version)

   this logic works off the premise that the version string for desk docket
     follows this format:

    version+[major minor build] (e.g. version+[0 0 1])
*/
var fs = require('fs');
module.exports = ({ github }, pkgfile, desks) => {
  const pkg = JSON.parse(fs.readFileSync(pkgfile));
  const pkgver = pkg.version.split('.');
  console.log(`bump.js: package version = ${pkg.version}`);
  for (let i = 0; i < desks.length; i++) {
    const desk = desks[i];
    console.log(`bump.js: reading file '${desk}/desk.docket-0'...`);
    const docketInfo = fs.readFileSync(`${desk}/desk.docket-0`).toString();
    console.log(`bump.js: docketInfo = ${typeof docketInfo} ${docketInfo}`);
    let lines = docketInfo.split('\n');
    for (let j = 0; j < lines.length; j++) {
      const parts = lines[j].split('+');
      if (parts[0].trim() === 'version') {
        let ver = parts[1].trim();
        ver = ver.substring(1, ver.length - 1);
        let mmb = ver.split(' ');
        // set to match the package version which will have already been updated
        // by an earlier build step and indicates the latest release version
        mmb[0] = pkgver[0];
        mmb[1] = pkgver[1];
        mmb[2] = pkgver[2];
        console.log(
          `./desks/${desk}/desk.docket-0: version string found. replacing ${ver} with ${mmb.join(
            ' '
          )}`
        );
        if (mmb[2] === '99' && mmb[1] === '99') {
          mmb[2] = '0';
          mmb[1] = '0';
          mmb[0] = (Number.parseInt(mmb[0]) + 1).toString();
        } else if (mmb[2] === '99') {
          mmb[2] = '0';
          mmb[1] = (Number.parseInt(mmb[1]) + 1).toString();
        }
        lines[j] = `${parts[0]}+[${mmb[0]} ${mmb[1]} ${mmb[2]}]`;
        fs.writeFileSync(`${desk}/desk.docket-0`, lines.join('\n'));
        break;
      }
    }
  }
  return pkg.version;
};
