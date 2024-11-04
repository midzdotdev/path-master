import { describe, test } from "vitest";
import { dynamicFileFixture, staticFileFixture } from "~/__testing/fixtures";
import { getPath } from "~/api";

describe("getPath", () => {
  test("requires dependencies when not empty and properly constrains structure", () => {
    getPath(staticFileFixture, "");
    // @ts-expect-error The dependencies must be empty.
    getPath(staticFileNode, "", { hello: true });

    getPath(dynamicFileFixture, "", { fileParam: "hello" });
    // @ts-expect-error Requires dependencies.
    getPath(dynamicFileFixture, "");
    // @ts-expect-error Dependencies must be the correct type.
    getPath(dynamicFileFixture, "", {});
    // @ts-expect-error Dependencies must be the correct type.
    getPath(dynamicFileFixture, "", { hello: true });
  });
});
