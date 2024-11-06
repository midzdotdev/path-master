import { expectTypeOf, test } from "vitest";
import { hlsPackageFixture } from "../__testing/fixtures";
import { collectDependencies, collectPath, getKeypaths } from "./multi-node";

test("collectDependencies", () => {
  expectTypeOf<
    collectDependencies<typeof hlsPackageFixture, "">
  >().toEqualTypeOf<{ videoId: number }>();

  expectTypeOf<
    collectDependencies<typeof hlsPackageFixture, "manifest">
  >().toEqualTypeOf<{
    videoId: number;
  }>();

  expectTypeOf<
    collectDependencies<typeof hlsPackageFixture, "variantStream.playlist">
  >().toEqualTypeOf<{
    videoId: number;
    quality: number;
  }>();

  expectTypeOf<
    collectDependencies<typeof hlsPackageFixture, "variantStream.segment">
  >().toEqualTypeOf<{
    videoId: number;
    quality: number;
    segmentIndex: number;
  }>();

  expectTypeOf<
    collectDependencies<(typeof hlsPackageFixture)["children"]["manifest"], "">
  >().toEqualTypeOf<{}>();
});

test("getLeafKeys", () => {
  expectTypeOf<getKeypaths<typeof hlsPackageFixture>>().toEqualTypeOf<
    | ""
    | "manifest"
    | "variantStream"
    | "variantStream.playlist"
    | "variantStream.segment"
  >();

  expectTypeOf<
    getKeypaths<(typeof hlsPackageFixture)["children"]["manifest"]>
  >().toEqualTypeOf<"">();
});

test("collectPath", () => {
  expectTypeOf<
    collectPath<typeof hlsPackageFixture, "manifest">
  >().toEqualTypeOf<`videos/${number}/master.m3u8`>();

  expectTypeOf<
    collectPath<typeof hlsPackageFixture, "variantStream.playlist">
  >().toEqualTypeOf<`videos/${number}/stream_${number}/playlist.m3u8`>();

  expectTypeOf<
    collectPath<typeof hlsPackageFixture, "variantStream.segment">
  >().toEqualTypeOf<`videos/${number}/stream_${number}/segment_${number}.ts`>();
});
