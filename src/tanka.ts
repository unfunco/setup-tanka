import * as tc from '@actions/tool-cache';

export async function downloadVersion(version: string) {
  const downloadUrl = getDownloadUrl(version, 'linux', 'amd64');
  return await tc.downloadTool(downloadUrl);
}

export function getDownloadUrl(version: string, os: string, arch: string): string {
  return `https://github.com/grafana/tanka/releases/download/v${version}/tk-${os}-${arch}`;
}
