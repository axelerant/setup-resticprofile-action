import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as httpm from '@actions/http-client'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export interface GitHubRelease {
  tag_name: string
  name: string
}

/**
 * Get the latest release version from a GitHub repository
 *
 * @param owner - The repository owner
 * @param repo - The repository name
 * @returns The latest version tag (e.g., "v0.18.1")
 */
export async function getLatestVersion(
  owner: string,
  repo: string
): Promise<string> {
  const http = new httpm.HttpClient('setup-resticprofile-action')
  const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`

  core.info(`Fetching latest version from ${url}`)

  const response = await http.getJson<GitHubRelease>(url)

  if (!response.result || !response.result.tag_name) {
    throw new Error(
      `Failed to fetch latest release for ${owner}/${repo}: No tag_name found`
    )
  }

  const version = response.result.tag_name
  core.info(`Latest version: ${version}`)

  return version
}

/**
 * Get the platform string for the current OS
 *
 * @returns Platform string (e.g., "darwin", "linux", "windows")
 */
export function getPlatform(): string {
  const platform = os.platform()

  switch (platform) {
    case 'darwin':
      return 'darwin'
    case 'linux':
      return 'linux'
    case 'win32':
      return 'windows'
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}

/**
 * Get the architecture string for the current system
 *
 * @returns Architecture string (e.g., "amd64", "arm64", "386")
 */
export function getArch(): string {
  const arch = os.arch()

  switch (arch) {
    case 'x64':
      return 'amd64'
    case 'arm64':
      return 'arm64'
    case 'ia32':
      return '386'
    default:
      throw new Error(`Unsupported architecture: ${arch}`)
  }
}

/**
 * Build the download URL for restic
 *
 * @param version - The version to download (with 'v' prefix, e.g., "v0.18.1")
 * @returns The download URL
 */
export function getResticDownloadUrl(version: string): string {
  const platform = getPlatform()
  const arch = getArch()

  // Remove 'v' prefix from version for the filename
  const versionNumber = version.startsWith('v') ? version.slice(1) : version

  // restic uses .bz2 for all platforms
  return `https://github.com/restic/restic/releases/download/${version}/restic_${versionNumber}_${platform}_${arch}.bz2`
}

/**
 * Build the download URL for resticprofile
 *
 * @param version - The version to download (with 'v' prefix, e.g., "v0.32.0")
 * @returns The download URL
 */
export function getResticprofileDownloadUrl(version: string): string {
  const platform = getPlatform()
  const arch = getArch()

  // Remove 'v' prefix from version for the filename
  const versionNumber = version.startsWith('v') ? version.slice(1) : version

  // resticprofile uses .tar.gz for all platforms
  return `https://github.com/creativeprojects/resticprofile/releases/download/${version}/resticprofile_${versionNumber}_${platform}_${arch}.tar.gz`
}

/**
 * Download a file from a URL to a specific destination path
 *
 * @param url - The URL to download from
 * @param destPath - The destination path where the file should be saved
 * @returns Path to the downloaded file
 */
export async function downloadFile(
  url: string,
  destPath: string
): Promise<string> {
  core.info(`Downloading from ${url} to ${destPath}`)

  try {
    const downloadPath = await tc.downloadTool(url, destPath)
    core.info(`Downloaded to ${downloadPath}`)
    return downloadPath
  } catch (error) {
    throw new Error(
      `Failed to download from ${url}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Extract a .bz2 file in-place
 *
 * @param archivePath - Path to the .bz2 file
 * @returns Path to the extracted file
 */
export async function extractBz2(archivePath: string): Promise<string> {
  core.info(`Extracting ${archivePath}`)

  // Use bunzip2 to extract in-place (removes .bz2 extension automatically)
  await exec.exec('bunzip2', [archivePath])

  // Get the extracted file path (without .bz2 extension)
  const extractedPath = archivePath.replace(/\.bz2$/, '')

  core.info(`Extracted to ${extractedPath}`)

  return extractedPath
}

/**
 * Extract a .tar.gz file
 *
 * @param archivePath - Path to the .tar.gz file
 * @param destDir - Destination directory for extraction
 * @returns Path to the destination directory
 */
export async function extractTarGz(
  archivePath: string,
  destDir: string
): Promise<string> {
  core.info(`Extracting ${archivePath} to ${destDir}`)

  // Use tool-cache's extractTar which handles .tar.gz
  const extractedPath = await tc.extractTar(archivePath, destDir)

  core.info(`Extracted to ${extractedPath}`)

  return extractedPath
}

/**
 * Make a file executable
 *
 * @param filePath - Path to the file
 */
export async function makeExecutable(filePath: string): Promise<void> {
  core.info(`Making ${filePath} executable`)

  if (os.platform() !== 'win32') {
    await exec.exec('chmod', ['+x', filePath])
  }
}

/**
 * Move a file to a destination path
 *
 * @param sourcePath - Source file path
 * @param destPath - Destination file path
 */
export function moveFile(sourcePath: string, destPath: string): void {
  core.info(`Moving ${sourcePath} to ${destPath}`)

  // Ensure destination directory exists
  const destDir = path.dirname(destPath)
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  fs.renameSync(sourcePath, destPath)

  core.info(`Moved to ${destPath}`)
}
