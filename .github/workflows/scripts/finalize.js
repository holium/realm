/*
  @author:  lodlev-migdev
  @purpose: this script is run at the end of every build, even if build errors
    or cancelations happen.

    use this as an opportunity to re-enable the workflow that was disabled
     when the build started (to prevent multiple builds at the same time running)
*/
var fs = require('fs');
module.exports = async ({ github, context }, workflowId, ci) => {
  // re-enable the workflow that was disabled when the build started
  // console.log(`enabling workflow ${workflowId}...`);
  // await github.request(
  //   'PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable',
  //   {
  //     owner: 'holium',
  //     repo: 'realm',
  //     workflow_id: workflowId,
  //   }
  // );
};
