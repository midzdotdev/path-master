import { expectTypeOf } from "vitest";
import { dir, DirNode, file, FileNode } from "../model";

export const staticFileFixture = file("file.ext");

export const dynamicFileFixture = file(
  ({ fileParam }: { fileParam: string }) => `file_${fileParam}.ext`
);

export const hlsPackageFixture = dir(
  ({ videoId }: { videoId: number }) => `videos/${videoId}`,
  {
    manifest: file(`master.m3u8`),
    variantStream: dir(
      ({ quality }: { quality: number }) => `stream_${quality}`,
      {
        playlist: file(`playlist.m3u8`),
        segment: file(
          ({ segmentIndex }: { segmentIndex: number }) =>
            `segment_${segmentIndex + 1}.ts`
        ),
      }
    ),
  }
);

expectTypeOf(hlsPackageFixture).toEqualTypeOf<
  DirNode<
    { videoId: number },
    `videos/${number}`,
    {
      manifest: FileNode<unknown, `master.m3u8`>;
      variantStream: DirNode<
        { quality: number },
        `stream_${number}`,
        {
          playlist: FileNode<unknown, `playlist.m3u8`>;
          segment: FileNode<{ segmentIndex: number }, `segment_${number}.ts`>;
        }
      >;
    }
  >
>();
