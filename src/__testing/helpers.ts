import { getRelativeFsPath, getRelativeUrlPath } from "~/api";
import { RelativePathMode } from "~/utils/relative-path";

export const getRelativePath = {
  fs: getRelativeFsPath,
  url: getRelativeUrlPath,
} satisfies Record<RelativePathMode, any>;
