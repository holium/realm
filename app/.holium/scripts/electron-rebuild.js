import { execSync } from 'child_process';
import fs from 'fs';
import { dependencies } from '../../release/app/package.json';
import webpackPaths from '../configs/webpack.paths';

if (
  Object.keys(dependencies || {}).length > 0 &&
  fs.existsSync(webpackPaths.appNodeModulesPath)
) {
  const electronRebuildCmd =
    '../../node_modules/.bin/electron-rebuild --force --types prod,dev,optional --module-dir .';
  const cmd =
    process.platform === 'win32'
      ? electronRebuildCmd.replace(/\//g, '\\')
      : electronRebuildCmd;

  execSync(cmd, {
    cwd: webpackPaths.appPath,
    stdio: 'inherit',
  });

  // Rebuild better-sqlite3
  // const rebuildSqlite3Cmd =
  //   '../../node_modules/.bin/electron-rebuild -f -w better-sqlite3';
  // const cmd2 =
  //   process.platform === 'win32'
  //     ? rebuildSqlite3Cmd.replace(/\//g, '\\')
  //     : rebuildSqlite3Cmd;
  // execSync(cmd2, {
  //   cwd: webpackPaths.appPath,
  //   stdio: 'inherit',
  // });
}
