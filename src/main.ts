import * as core from '@actions/core'
import * as path from 'path'
import * as os from 'os'
import {
  getLatestVersion,
  getResticDownloadUrl,
  getResticprofileDownloadUrl,
  downloadFile,
  extractBz2,
  extractTarGz,
  makeExecutable,
  moveFile
} from './utils.js'

/**
 * Install restic binary
 *
 * @param version - The version to install (e.g., "latest" or "v0.18.1")
 * @param installPath - The path to install the binary
 */
async function installRestic(
  version: string,
  installPath: string
): Promise<void> {
  core.info(`Installing restic version: ${version}`)

  // Get the actual version if "latest" is specified
  let actualVersion = version
  if (version === 'latest') {
    actualVersion = await getLatestVersion('restic', 'restic')
  }

  // Ensure version has 'v' prefix
  if (!actualVersion.startsWith('v')) {
    actualVersion = `v${actualVersion}`
  }

  // Build download URL and download the file directly to install path
  const downloadUrl = getResticDownloadUrl(actualVersion)
  const downloadedPath = await downloadFile(
    downloadUrl,
    path.join(installPath, path.basename(downloadUrl))
  )

  // Extract the .bz2 file in-place
  const extractedPath = await extractBz2(downloadedPath)

  // Make the binary executable
  await makeExecutable(extractedPath)

  // Rename to final name if needed (remove version info from filename)
  const finalPath = path.join(installPath, 'restic')
  if (extractedPath !== finalPath) {
    moveFile(extractedPath, finalPath)
  }

  core.info(`✓ restic ${actualVersion} installed successfully at ${finalPath}`)
}

/**
 * Install resticprofile binary
 *
 * @param version - The version to install (e.g., "latest" or "v0.32.0")
 * @param installPath - The path to install the binary
 */
async function installResticprofile(
  version: string,
  installPath: string
): Promise<void> {
  core.info(`Installing resticprofile version: ${version}`)

  // Get the actual version if "latest" is specified
  let actualVersion = version
  if (version === 'latest') {
    actualVersion = await getLatestVersion('creativeprojects', 'resticprofile')
  }

  // Ensure version has 'v' prefix
  if (!actualVersion.startsWith('v')) {
    actualVersion = `v${actualVersion}`
  }

  // Build download URL and download the file to a temporary directory
  const downloadUrl = getResticprofileDownloadUrl(actualVersion)
  const tempDir = path.join(os.tmpdir(), 'resticprofile-extract')
  const downloadedPath = await downloadFile(
    downloadUrl,
    path.join(tempDir, path.basename(downloadUrl))
  )

  // Extract the .tar.gz file
  const extractedDir = await extractTarGz(downloadedPath, tempDir)

  // The resticprofile binary should be in the extracted directory
  const binaryPath = path.join(extractedDir, 'resticprofile')

  // Make the binary executable
  await makeExecutable(binaryPath)

  // Move to the final installation path
  const finalPath = path.join(installPath, 'resticprofile')
  moveFile(binaryPath, finalPath)

  core.info(
    `✓ resticprofile ${actualVersion} installed successfully at ${finalPath}`
  )
}

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get inputs
    const installResticInput = core.getInput('install-restic')
    const resticVersion = core.getInput('restic-version')
    const resticprofileVersion = core.getInput('resticprofile-version')
    const installPath = core.getInput('path')

    core.info('=== Setup restic and resticprofile ===')
    core.info(`Install path: ${installPath}`)

    let resticInstalled = false
    let resticprofileInstalled = false

    // Install restic if requested
    if (installResticInput === 'true') {
      try {
        await installRestic(resticVersion, installPath)
        resticInstalled = true
      } catch (error) {
        core.error(
          `Failed to install restic: ${error instanceof Error ? error.message : String(error)}`
        )
        throw error
      }
    } else {
      core.info('Skipping restic installation (install-restic is not true)')
    }

    // Install resticprofile
    try {
      await installResticprofile(resticprofileVersion, installPath)
      resticprofileInstalled = true
    } catch (error) {
      core.error(
        `Failed to install resticprofile: ${error instanceof Error ? error.message : String(error)}`
      )
      throw error
    }

    // Set outputs
    core.setOutput('restic-installed', resticInstalled.toString())
    core.setOutput('resticprofile-installed', resticprofileInstalled.toString())

    core.info('=== Installation complete ===')
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
