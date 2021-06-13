import * as core from '@actions/core';

export async function main() {
  try {
    const specifiedTankaVersion = core.getInput('tanka-version');
    console.info(`Specified Tanka version: ${specifiedTankaVersion}`);
  } catch (e) {
    core.setFailed(e.message);
  }
}
