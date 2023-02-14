/*
  @author:  lodlev-migdev
  @purpose: bump the version of each desks in the desks array based on the
     version indicated by the ./app/release/app/package.json file (official Realm build version)

   this logic works off the premise that the version string for desk docket
     follows this format:

    version+[major minor build] (e.g. version+[0 0 1])
*/
var fs = require('fs');
module.exports = ({ github }, ci, desks) => {
  console.log(`bump.js: build version = ${ci.buildVersion}`);
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
        mmb[0] = ci.version.major;
        mmb[1] = ci.version.minor;
        mmb[2] = ci.version.build;
        console.log(
          `./desks/${desk}/desk.docket-0: version string found. replacing ${ver} with ${mmb.join(
            ' '
          )}`
        );
        lines[j] = `${parts[0]}+[${mmb[0]} ${mmb[1]} ${mmb[2]}]`;
        fs.writeFileSync(`${desk}/desk.docket-0`, lines.join('\n'));
        break;
      }
    }
  }
  return ci;
};
