/*
  @author:  lodlev-migdev
  @purpose: script to setup context and environment variables to be used
    by other jobs/steps in the workflow.

*/
var fs = require('fs');
module.exports = ({ github, context }, pkgfile) => {
  console.log(context);
  let ci = {
    // version "as-is" from package.json
    packageVersion: undefined,
    // version either set by PR title or based on packageVersion
    buildVersion: undefined,
  };
  const pkg = JSON.parse(fs.readFileSync(pkgfile));
  let incrementVersion = true;
  console.log(`init.js: package version = ${pkg.version}`);
  // default to staging/alpha build
  ci.channel = 'alpha';
  ci.buildVersion = pkg.version;
  ci.packageVersion = pkg.version;
  // test the title of the PR to see if it is a valid version string format.
  //  if so, use it as this build's version string (no modifications)
  if (context.payload.pull_request.title) {
    console.log(
      `init.js: PR title = '${context.payload.pull_request.title}'. testing if matches version format...`
    );
    const matches = context.payload.pull_request.title.match(
      /(release|staging)-(v|)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
    );
    if (matches) {
      console.log(
        `init.js: '${context.payload.pull_request.title}' matches version format. using as version string.`
      );
      // set version from PR title "as-is". do not auto increment
      incrementVersion = false;
      ci.buildVersion = context.payload.pull_request.title;
      ci.packageVersion = `${matches[2] ? 'v' : ''}${matches[3]}.${
        matches[4]
      }.${matches[5]}`;
    }
  }
  if (ci.buildVersion.startsWith('staging')) {
    console.log(
      `init.js: version string starts with 'staging'. setting ci channel to 'alpha'.`
    );
    ci.channel = 'alpha';
  } else if (ci.buildVersion.startsWith('release')) {
    console.log(
      `init.js: version string starts with 'release'. setting ci channel to 'release'.`
    );
    ci.channel = 'latest';
  }
  if (incrementVersion) {
    // if the PR title was not set , or it was set AND not in a version format, perform
    //  default version string manipulation by bumping the last portion of the semver by 1
    let prepend = false;
    // no PR title is set; therefore increment the build # by 1
    if (ci.packageVersion.startsWith('v')) {
      prepend = true;
      ci.packageVersion = ci.packageVersion.substring(1);
    }
    const parts = ci.packageVersion.split('.');
    ci.packageVersion = `${prepend ? 'v' : ''}${parts[0]}.${parts[1]}.${
      parseInt(parts[2]) + 1
    }`;
  }
  pkg.version = ci.packageVersion;
  fs.writeFileSync(pkgfile, JSON.stringify(pkg, null, '2'));
  return ci;
};
