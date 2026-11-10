// SPDX-FileCopyrightText: 2026 Daniel Morris <daniel@honestempire.com>
// SPDX-License-Identifier: MIT

import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import { chmod } from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import * as semver from 'semver'

const TOOL_NAME = 'tanka'

export async function install(tankaVersion: string): Promise<void> {
  const semanticVersion = formatVersion(tankaVersion)

  let toolPath = tc.find(TOOL_NAME, semanticVersion)
  if (toolPath) {
    core.info(`Found Grafana Tanka ${semanticVersion} in the tool cache`)
  } else {
    toolPath = await download(semanticVersion)
  }

  core.debug(`Add ${toolPath} to PATH`)
  core.addPath(toolPath)
}

async function download(semanticVersion: string): Promise<string> {
  const exeDownloadName = getExeDownloadName()
  const tkDownloadUrl = `https://github.com/grafana/tanka/releases/download/${semanticVersion}/${exeDownloadName}`

  core.info(`Download Grafana Tanka ${semanticVersion} from ${tkDownloadUrl}`)
  const tkDownload = await tc.downloadTool(tkDownloadUrl)

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
  if (os.platform().toString() === 'win32') {
    return 'tk.exe'
  }

  return 'tk'
}

function getExeDownloadName(): string {
  let arch: string = os.arch()
  let ext = ''
  let platform = os.platform().toString()

  if (arch === 'x64') {
    arch = 'amd64'
  }

  if (platform === 'win32') {
    platform = 'windows'
    ext = '.exe'
  }

  return `tk-${platform}-${arch}${ext}`
}

function formatVersion(version: string): string {
  const parts: string[] = version.split('-')
  let versionPart: string = parts[0] ?? ''
  const preReleasePart: string = parts.length > 1 ? `-${parts[1]}` : ''

  // Convert X.Y to X.Y.0
  const versionParts: string[] = versionPart.split('.')
  if (versionParts.length === 2) {
    versionPart += '.0'
  }

  // 0.16.0 appears to be the first version with releases for different
  // platforms and architectures, so to make things easy, only support
  // versions greater than or equal to 0.16.0.
  if (semver.lt(versionPart, '0.16.0')) {
    throw new Error('Only versions >= 0.16.0 are supported')
  }

  // Convert X.Y.Z to vX.Y.Z
  if ('v' !== versionPart.substring(0, 1)) {
    versionPart = `v${versionPart}`
  }

  return `${versionPart}${preReleasePart}`
}
