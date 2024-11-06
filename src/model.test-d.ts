import { expectTypeOf, test } from "vitest";
import { dir, DirNode, file, FileNode } from "./model";

const staticFileFixture = file(`testy_test`);
const dynamicFileFixture = file(({ test }: { test: number }) => `test_${test}`);

test("prevents empty name", () => {
  // @ts-expect-error Pathnames must not be empty.
  file("");
  // @ts-expect-error Pathnames must not be empty.
  file(({ test }: { test: number }) => "");
});

test("prevents empty dependencies", () => {
  // @ts-expect-error Dependencies must be specified in a path function.
  file(() => `test`);

  // @ts-expect-error Dependencies should not be empty.
  file(({}: {}) => `test_${test}`);
});

test("gives expected type for static file node", () => {
  expectTypeOf(staticFileFixture).toEqualTypeOf<
    FileNode<unknown, `testy_test`>
  >();
});

test("gives expected type for dynamic file node", () => {
  expectTypeOf(dynamicFileFixture).toEqualTypeOf<
    FileNode<{ test: number }, `test_${number}`>
  >();
});

test("gives expected type for dir (dynamic) > file (dynamic)", () => {
  expectTypeOf(
    dir(({ dirParam }: { dirParam: number }) => `dir_${dirParam}`, {
      myFile: dynamicFileFixture,
    })
  ).toEqualTypeOf<
    DirNode<
      { dirParam: number },
      `dir_${number}`,
      { myFile: typeof dynamicFileFixture }
    >
  >();
});

test("gives expected type for dir (static) > file (dynamic)", () => {
  expectTypeOf(
    dir(`static_dir`, {
      myFile: dynamicFileFixture,
    })
  ).toEqualTypeOf<
    DirNode<unknown, `static_dir`, { myFile: typeof dynamicFileFixture }>
  >();
});

test("gives expected type for dir (static) x4 > file (static)", () => {
  expectTypeOf(
    dir(`deeply_nested`, {
      one: dir(`one`, {
        two: dir(`two`, {
          three: dir(`three`, {
            file: file(`file`),
          }),
        }),
      }),
    })
  ).toEqualTypeOf<
    DirNode<
      unknown,
      `deeply_nested`,
      {
        one: DirNode<
          unknown,
          `one`,
          {
            two: DirNode<
              unknown,
              `two`,
              {
                three: DirNode<
                  unknown,
                  `three`,
                  { file: FileNode<unknown, `file`> }
                >;
              }
            >;
          }
        >;
      }
    >
  >();
});
