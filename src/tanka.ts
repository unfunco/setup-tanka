// SPDX-FileCopyrightText: 2026 Daniel Morris <daniel@honestempire.com>
// SPDX-License-Identifier: MIT

import * as core from '@actions/core'
import { HttpClient } from '@actions/http-client'
import * as tc from '@actions/tool-cache'
import { chmod } from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import * as semver from 'semver'
import { sha256 } from './digest.ts'

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

export interface Installation {
  // Whether the executable was found in the tool cache instead of downloaded.
  cacheHit: boolean
  // The installed version in X.Y.Z form.
  version: string
}

interface Release {
  assets: { digest: string | null; name: string }[]
}

export async function install(
  tankaVersion: string,
  token: string = '',
): Promise<Installation> {
  const semanticVersion = formatVersion(tankaVersion)
  const releaseAsset = getReleaseAsset()

  let toolPath = tc.find(TOOL_NAME, semanticVersion)
  const cacheHit = toolPath !== ''
  if (cacheHit) {
    core.info(`Found Grafana Tanka ${semanticVersion} in the tool cache`)
  } else {
    toolPath = await download(semanticVersion, releaseAsset, token)
  }

  core.debug(`Add ${toolPath} to PATH`)
  core.addPath(toolPath)

  return { cacheHit, version: semanticVersion.slice(1) }
}

async function download(
  semanticVersion: string,
  releaseAsset: string,
  token: string,
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

  await verify(tkDownload, semanticVersion, releaseAsset, token)

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

// Compare the download with the digest that GitHub computed when the asset
// was uploaded to the release. A download that does not match is never
// installed. Releases published before GitHub recorded digests, and failures
// to read the release, leave the download unverified rather than failing.
async function verify(
  tkDownload: string,
  semanticVersion: string,
  releaseAsset: string,
  token: string,
): Promise<void> {
  let expected: string | null | undefined
  try {
    expected = await getReleaseAssetDigest(semanticVersion, releaseAsset, token)
  } catch (e: unknown) {
    const reason = e instanceof Error ? e.message : String(e)
    core.warning(
      `Could not read the digest of ${releaseAsset} from the Grafana Tanka ${semanticVersion} release, the download has not been verified: ${reason}`,
    )

    return
  }

  if (!expected?.startsWith('sha256:')) {
    core.info(
      `GitHub has no SHA-256 digest for ${releaseAsset} in the Grafana Tanka ${semanticVersion} release, the download has not been verified`,
    )

    return
  }

  const actual = await sha256(tkDownload)
  if (actual !== expected) {
    throw new Error(
      `The digest of ${releaseAsset} does not match the Grafana Tanka ${semanticVersion} release, expected ${expected} but downloaded ${actual}`,
    )
  }

  core.info(`Verified ${releaseAsset} against ${expected}`)
}

async function getReleaseAssetDigest(
  semanticVersion: string,
  releaseAsset: string,
  token: string,
): Promise<string | null | undefined> {
  const http = new HttpClient('unfunco/setup-tanka')
  const { result, statusCode } = await http.getJson<Release>(
    `https://api.github.com/repos/grafana/tanka/releases/tags/${semanticVersion}`,
    {
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      ...(token && { authorization: `Bearer ${token}` }),
    },
  )

  if (!result) {
    throw new Error(`Unexpected HTTP response: ${statusCode}`)
  }

  return result.assets.find(({ name }) => name === releaseAsset)?.digest
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
