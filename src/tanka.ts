// SPDX-FileCopyrightText: 2026 Daniel Morris <daniel@honestempire.com>
// SPDX-License-Identifier: MIT

import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import { chmod } from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import * as semver from 'semver'

const TOOL_NAME = 'tanka'

// 0.16.0 appears to be the first version with releases for different
// platforms and architectures, so to make things easy, only support
// versions greater than or equal to 0.16.0.
const MINIMUM_VERSION = '0.16.0'

// The release assets Tanka publishes, keyed by the platform and architecture
// reported by Node.js. There is no Windows build for arm64, but Windows on
// arm64 runs the amd64 build under emulation.
const RELEASE_ASSETS: Readonly<Record<string, string>> = {
  'darwin/arm64': 'tk-darwin-arm64',
  'darwin/x64': 'tk-darwin-amd64',
  'linux/arm': 'tk-linux-arm',
  'linux/arm64': 'tk-linux-arm64',
  'linux/x64': 'tk-linux-amd64',
  'win32/arm64': 'tk-windows-amd64.exe',
  'win32/x64': 'tk-windows-amd64.exe',
}

export async function install(tankaVersion: string): Promise<void> {
  const semanticVersion = formatVersion(tankaVersion)
  const releaseAsset = getReleaseAsset()

  let toolPath = tc.find(TOOL_NAME, semanticVersion)
  if (toolPath) {
    core.info(`Found Grafana Tanka ${semanticVersion} in the tool cache`)
  } else {
    toolPath = await download(semanticVersion, releaseAsset)
  }

  core.debug(`Add ${toolPath} to PATH`)
  core.addPath(toolPath)
}

async function download(
  semanticVersion: string,
  releaseAsset: string,
): Promise<string> {
  const tkDownloadUrl = `https://github.com/grafana/tanka/releases/download/${semanticVersion}/${releaseAsset}`

  core.info(`Download Grafana Tanka ${semanticVersion} from ${tkDownloadUrl}`)
  let tkDownload: string
  try {
    tkDownload = await tc.downloadTool(tkDownloadUrl)
  } catch (e: unknown) {
    if (e instanceof tc.HTTPError && e.httpStatusCode === 404) {
      throw new Error(
        `Grafana Tanka ${semanticVersion} has no release asset named ${releaseAsset}, check that the version exists and supports this platform`,
        { cause: e },
      )
    }

    throw e
  }

  const exeName = getExeName()
  const toolPath = await tc.cacheFile(
    tkDownload,
    exeName,
    TOOL_NAME,
    semanticVersion,
  )

  const tk = path.join(toolPath, exeName)
  core.debug(`Make ${tk} executable`)
  await chmod(tk, 0o755)

  return toolPath
}

function getExeName(): string {
  return os.platform() === 'win32' ? 'tk.exe' : 'tk'
}

function getReleaseAsset(): string {
  const target = `${os.platform()}/${os.arch()}`
  const releaseAsset = RELEASE_ASSETS[target]
  if (!releaseAsset) {
    throw new Error(`Grafana Tanka is not available for ${target}`)
  }

  return releaseAsset
}

// Convert X.Y, X.Y.Z, vX.Y, and vX.Y.Z, each with an optional prerelease, to
// the vX.Y.Z form that Tanka uses to tag its releases.
function formatVersion(version: string): string {
  const candidate = version.replace(/^(\s*v?\d+\.\d+)(?=-|\s*$)/, '$1.0')

  const semanticVersion = semver.parse(candidate)
  if (!semanticVersion) {
    throw new Error(
      `"${version}" is not a valid version, expected a version such as ${MINIMUM_VERSION}`,
    )
  }

  if (semver.lt(semanticVersion, MINIMUM_VERSION)) {
    throw new Error(`Only versions >= ${MINIMUM_VERSION} are supported`)
  }

  return `v${semanticVersion.version}`
}
