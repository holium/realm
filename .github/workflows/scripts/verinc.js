var fs = require("fs");
module.exports = ({ github, context }) => {
  const pkg = JSON.parse(fs.readFileSync("./app/release/app/package.json"));
  return pkg.value;
};
