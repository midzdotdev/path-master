import { expectTypeOf, test } from "vitest";
import { hlsPackageFixture } from "~/__testing/fixtures";
import { getChildren, getDependencies, getPath } from "~/types/single-node";

test("getDependencies", () => {
  expectTypeOf<getDependencies<typeof hlsPackageFixture>>().toEqualTypeOf<{
    videoId: number;
  }>();

  expectTypeOf<
    getDependencies<
      (typeof hlsPackageFixture)["children"]["variantStream"]["children"]["segment"]
    >
  >().toEqualTypeOf<{
    segmentIndex: number;
  }>();

  expectTypeOf<
    getDependencies<(typeof hlsPackageFixture)["children"]["manifest"]>
  >().toEqualTypeOf<unknown>();
});

test("getPath", () => {
  expectTypeOf<
    getPath<typeof hlsPackageFixture>
  >().toEqualTypeOf<`videos/${number}`>();

  expectTypeOf<
    getPath<(typeof hlsPackageFixture)["children"]["manifest"]>
  >().toEqualTypeOf<`master.m3u8`>();
});

test("getChildren", () => {
  expectTypeOf<getChildren<typeof hlsPackageFixture>>().toEqualTypeOf<
    (typeof hlsPackageFixture)["children"]
  >();

  expectTypeOf<
    getChildren<(typeof hlsPackageFixture)["children"]["manifest"]>
  >().toEqualTypeOf<{}>();
});
