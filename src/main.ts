// Copyright © 2021 Daniel Morris
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at:
//
// https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as core from '@actions/core'
import * as tanka from './tanka'

export const main = async (): Promise<void> => {
  try {
    const tankaVersion: string = core.getInput('tanka-version')
    await tanka.install(tankaVersion)
  } catch (e: unknown) {
    if (e instanceof Error) {
      core.setFailed(e.message)
    }
  }
}
