import { describe, expect, test } from 'vitest'
import {
  dynamicFileFixture,
  hlsPackageFixture,
  staticFileFixture,
} from './__testing/fixtures'
import { getRelativePath } from './__testing/helpers'
import { getPath } from './api'
import { RelativePathMode } from './utils/relative-path'

describe('getPath', () => {
  describe('gives the expected path of the root node (keypath: "")', () => {
    test('when root is a dir node', () => {
      expect(
        getPath(hlsPackageFixture, '', {
          videoId: 1,
        })
      ).toBe('videos/1/')
    })

    test('when root is a file node', () => {
      expect(getPath(staticFileFixture, '')).toBe('file.ext')
    })
  })

  test('gives the expected path of a file (leaf) node', () => {
    expect(getPath(staticFileFixture, '')).toBe('file.ext')
    expect(getPath(staticFileFixture, '', {})).toBe('file.ext')

    const fileParam = 'hello'
    expect(getPath(dynamicFileFixture, '', { fileParam })).toBe(
      `file_${fileParam}.ext`
    )
  })

  test('gives the expected path of a dir (non-leaf) node', () => {
    expect(
      getPath(hlsPackageFixture, 'variantStream', { videoId: 1, quality: 2 })
    ).toBe('videos/1/stream_2/')
  })
})

describe('getRelativePath', () => {
  describe.each<RelativePathMode>(['fs', 'url'])('mode: %s', (mode) => {
    test('from file to file', () => {
      expect(
        getRelativePath[mode](
          hlsPackageFixture,
          ['manifest', { videoId: 1 }],
          ['variantStream.playlist', { videoId: 1, quality: 2 }]
        )
      ).toBe(
        {
          fs: '../stream_2/playlist.m3u8',
          url: 'stream_2/playlist.m3u8',
        }[mode]
      )
    })

    test('from dir to a file', () => {
      expect(
        getRelativePath[mode](
          hlsPackageFixture,
          ['', { videoId: 1 }],
          ['manifest', { videoId: 1 }]
        )
      ).toBe(
        {
          fs: 'master.m3u8',
          url: 'master.m3u8',
        }[mode]
      )
    })
  })
})
