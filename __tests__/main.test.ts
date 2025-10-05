/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

// Mock utils module
const mockUtils = {
  getLatestVersion: jest.fn<() => Promise<string>>(),
  getResticDownloadUrl: jest.fn<() => string>(),
  getResticprofileDownloadUrl: jest.fn<() => string>(),
  downloadFile: jest.fn<() => Promise<string>>(),
  extractBz2: jest.fn<() => Promise<string>>(),
  extractTarGz: jest.fn<() => Promise<string>>(),
  makeExecutable: jest.fn<() => Promise<void>>(),
  moveFile: jest.fn<() => void>()
}

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/utils.js', () => mockUtils)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    // Set the action's inputs as return values from core.getInput().
    core.getInput.mockImplementation((name: string) => {
      switch (name) {
        case 'install-restic':
          return 'true'
        case 'restic-version':
          return 'latest'
        case 'resticprofile-version':
          return 'latest'
        case 'path':
          return '/usr/local/bin'
        default:
          return ''
      }
    })

    // Mock utils functions
    mockUtils.getLatestVersion.mockResolvedValue('v0.18.1')
    mockUtils.getResticDownloadUrl.mockReturnValue(
      'https://github.com/restic/restic/releases/download/v0.18.1/restic_0.18.1_darwin_amd64.bz2'
    )
    mockUtils.getResticprofileDownloadUrl.mockReturnValue(
      'https://github.com/creativeprojects/resticprofile/releases/download/v0.32.0/resticprofile_0.32.0_darwin_arm64.tar.gz'
    )
    mockUtils.downloadFile.mockResolvedValue('/tmp/downloaded-file')
    mockUtils.extractBz2.mockResolvedValue('/tmp/extracted-file')
    mockUtils.extractTarGz.mockResolvedValue('/tmp/extracted-dir')
    mockUtils.makeExecutable.mockResolvedValue(undefined)
    mockUtils.moveFile.mockReturnValue(undefined)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Installs restic and resticprofile successfully', async () => {
    await run()

    // Verify outputs were set
    expect(core.setOutput).toHaveBeenCalledWith('restic-installed', 'true')
    expect(core.setOutput).toHaveBeenCalledWith(
      'resticprofile-installed',
      'true'
    )

    // Verify getLatestVersion was called for both tools
    expect(mockUtils.getLatestVersion).toHaveBeenCalledWith('restic', 'restic')
    expect(mockUtils.getLatestVersion).toHaveBeenCalledWith(
      'creativeprojects',
      'resticprofile'
    )

    // Verify download and extraction were called
    expect(mockUtils.downloadFile).toHaveBeenCalledTimes(2)
    expect(mockUtils.extractBz2).toHaveBeenCalledTimes(1)
    expect(mockUtils.extractTarGz).toHaveBeenCalledTimes(1)
    expect(mockUtils.makeExecutable).toHaveBeenCalledTimes(2)
    expect(mockUtils.moveFile).toHaveBeenCalledTimes(2)
  })

  it('Skips restic installation when install-restic is false', async () => {
    core.getInput.mockImplementation((name: string) => {
      switch (name) {
        case 'install-restic':
          return 'false'
        case 'resticprofile-version':
          return 'latest'
        case 'path':
          return '/usr/local/bin'
        default:
          return ''
      }
    })

    await run()

    // Verify only resticprofile was installed
    expect(core.setOutput).toHaveBeenCalledWith('restic-installed', 'false')
    expect(core.setOutput).toHaveBeenCalledWith(
      'resticprofile-installed',
      'true'
    )

    // Verify getLatestVersion was only called for resticprofile
    expect(mockUtils.getLatestVersion).toHaveBeenCalledTimes(1)
    expect(mockUtils.getLatestVersion).toHaveBeenCalledWith(
      'creativeprojects',
      'resticprofile'
    )
  })

  it('Handles errors gracefully', async () => {
    mockUtils.downloadFile.mockRejectedValue(new Error('Download failed'))

    await run()

    // Verify setFailed was called
    expect(core.setFailed).toHaveBeenCalledWith('Download failed')
  })
})
