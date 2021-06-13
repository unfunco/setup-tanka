import * as core from '@actions/core';
import { installVersion } from "./tanka";

export async function main() {
  try {
    const specifiedTankaVersion = core.getInput('tanka-version');
    core.info(`Specified Tanka version: ${specifiedTankaVersion}`);
    await installVersion(specifiedTankaVersion);
  } catch (e) {
    core.setFailed(e.message);
  }
}
