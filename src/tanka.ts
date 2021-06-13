import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

export async function installVersion(version: string) {
  core.info(`Attempting to download Grafana Tanka ${version}`);
  const downloadPath = await tc.downloadTool(`https://github.com/grafana/tanka/releases/download/v${version}/tk-linux-amd64`);
  core.info(`Downloaded to ${downloadPath}`);
  return downloadPath;
}
