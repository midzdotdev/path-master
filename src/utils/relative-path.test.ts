import path from "node:path";
import { describe, expect, test } from "vitest";
import { getRelativePathBetween } from "~/utils/relative-path";

describe("getRelativePath", () => {
  describe("fs mode", () => {
    test.each(
      // prettier-ignore
      [
        ["identical", "a/b", "a/b", "."],
        ["parent", "a/b", "a/", "../"],
        ["great-grandparent", "a/b/c/d", "a/", "../../../"],
        ["sibling", "a/b", "a/c", "../c"],
        ["sibling's child", "a/b", "a/c/d", "../c/d"],
        ["child", "a", "a/b", "b"],
        ["great-grandchild", "a", "a/b/c/d", "b/c/d"],
        ["cousin", "a/b/c", "a/d/e", "../../d/e"],
        ["stranger", "a/b/c", "x/y/z", "../../../x/y/z"],
      ]
    )("%s (`%s` -> `%s`)", (_, from, to, expected) => {
      expect(to, "Test case is incorrect").toBe(path.join(from, expected));

      // verifies the test cases are valid using the URL Web API
      expect(getRelativePathBetween(from, to, "fs")).toBe(expected);
    });
  });

  describe("url mode", () => {
    test.each(
      // prettier-ignore
      [
        ["empty", "", "", "."],
        ["identical", "a/b", "a/b", "b"],
        ["identical (/)", "a/b/", "a/b/", "./"],
        ["parent", "a/b", "a/", "./" ],
        ["parent (/)", "a/b/", "a/", "../" ],
        ["great-grandparent", "a/b/c/d", "a/", "../../" ],
        ["great-grandparent (/)", "a/b/c/d/", "a/", "../../../" ],
        ["sibling", "a/b", "a/c", "c" ],
        ["sibling (/)", "a/b/", "a/c", "../c" ],
        ["sibling's child", "a/b", "a/c/d", "c/d" ],
        ["sibling's child (/)", "a/b/", "a/c/d", "../c/d" ],
        ["child", "a/b", "a/b/c", "b/c" ],
        ["child (/)", "a/b/", "a/b/c", "c" ],
        ["great-grandchild", "a", "a/b/c/d", "a/b/c/d" ],
        ["great-grandchild (/)", "a/", "a/b/c/d", "b/c/d" ],
        ["cousin", "a/b/c", "a/d/e", "../d/e" ],
        ["cousin (/)", "a/b/c/", "a/d/e", "../../d/e" ],
        ["stranger", "a/b/c", "x/y/z", "../../x/y/z" ],
        ["stranger (/)", "a/b/c/", "x/y/z", "../../../x/y/z" ],
      ]
    )("%s: (`%s` -> `%s`) gives `%s`", (_, from, to, expected) => {
      // verifies the test cases are valid using the URL Web API
      expect(
        new URL(expected, `https://foo.bar/${from}`).pathname.slice(1),
        "Test case is incorrect"
      ).toBe(to);

      expect(getRelativePathBetween(from, to, "url")).toBe(expected);
    });
  });
});
