import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

export async function downloadVersion(version: string) {
  core.info(`Attempting to download Grafana Tanka ${version}`);
  return await tc.downloadTool(`https://github.com/grafana/tanka/releases/download/v${version}/tk-linux-amd64`);
}
