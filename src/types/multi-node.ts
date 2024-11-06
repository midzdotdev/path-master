import { Any } from "ts-toolbelt";
import { DirNode, Node } from "../model";
import { Join } from "../utils/types";
import { getChildren, getDependencies, getPath } from "./single-node";

/**
 * Gets the keypaths for all nodes (root and children) in the model.
 * 
 * Keypaths are delimitted by a dot `"."` and are used to traverse the model.
 * The root node has a keypath of "".
 * 
 * @template TNode The model in which to search for keypaths.
 * @returns The keypaths for all nodes in the model.
 * 
 * @example
    ```ts
    import { dir, file, getKeypaths } from "path-master";

    const myModel = dir("d0", {
      file1: file("f1"),
      dir1: dir("d1", {
        file2: file("f2"),
      }),
    });

    type Keypaths = getKeypaths<typeof myModel>;
    //   ^? "" | "file1" | "dir1" | "dir1.file2"
    ```
 */
export type getKeypaths<TNode extends Node> = _getKeypaths<TNode, "">;

// prettier-ignore
type _getKeypaths<
  TCurrentNode extends Node,
  TCurrentKeypath extends string
> =
  | TCurrentKeypath
  | (
      TCurrentNode extends DirNode
        ? {
            [key in keyof getChildren<TCurrentNode> & string]: _getKeypaths<
              getChildren<TCurrentNode>[key],
              Join<TCurrentKeypath, ".", key>
            >;
          }[keyof getChildren<TCurrentNode> & string]
        : never
    );

/**
 * Collects the dependencies of a node (specified by its keypath) all the way from the root.
 *
 * Dependencies are the data required to generate the path of a node, and are defined with as an object type.
 * 
 * @template TNode The model in which to search for dependencies.
 * @template TKeypath The keypath of the node for which to collect dependencies.
 * 
 * @example
    ```ts
    import { dir, file, collectDependencies } from "path-master";

    const myModel = dir("d0", {
      file1: file("f1"),
      dir1: dir(({ dirParam }: { dirParam: string }) => `d1_${dirParam}`, {
        file2: file(({ fileParam }: { fileParam: number }) => `f2_${fileParam}`),
      }),
    });

    type File1Example = collectDependencies<typeof myModel, "file1">;
    //   ^? {}

    type Dir1Example = collectDependencies<typeof myModel, "dir1">;
    //   ^? { dirParam: string }

    type File2Example = collectDependencies<typeof myModel, "dir1.file2">;
    //   ^? { dirParam: string; fileParam: number }
    ```
 */
export type collectDependencies<
  TNode extends Node,
  TKeypath extends string
> = _collectDependencies<TNode, TKeypath, {}>;

// prettier-ignore
type _collectDependencies<
  TCurrentNode extends Node,
  TCurrentKeypath extends string,
  TCurrentDependencies
> =
  TCurrentKeypath extends `${infer key extends string}.${infer nextKeypath extends string}`
    ? key extends keyof getChildren<TCurrentNode>
      ? _collectDependencies<
          getChildren<TCurrentNode>[key],
          nextKeypath,
          TCurrentDependencies & getDependencies<TCurrentNode>
        >
      : never
    : TCurrentKeypath extends keyof getChildren<TCurrentNode>
      ? Any.Compute<
          & TCurrentDependencies
          & getDependencies<TCurrentNode>
          & getDependencies<getChildren<TCurrentNode>[TCurrentKeypath]>
        >
      : TCurrentKeypath extends ""
        ? Any.Compute<TCurrentDependencies & getDependencies<TCurrentNode>>
        : never;

/**
 * Gets the full path of a node (specified by its keypath) by concatenating each path during the tree traversal.
 * 
 * @template TNode The model in which to search for the path.
 * @template TKeypath The keypath of the node for which to get the path.
 * 
 * @example
    ```ts
    import { dir, file, collectPath } from "path-master";

    const myModel = dir("d0", {
      file1: file("f1"),
      dir1: dir(({ dirParam }: { dirParam: string }) => `d1_${dirParam}`, {
        file2: file(({ fileParam }: { fileParam: number }) => `f2_${fileParam}`),
      }),
    });

    type RootExample = collectPath<typeof myModel, "">;
    //   ^? "d0"

    type File2Example = collectPath<typeof myModel, "dir1.file2">;
    //   ^? `d0/d1_${string}/f2_${number}`
    ```
 */
export type collectPath<
  TNode extends Node,
  TKeypath extends string
> = _collectPath<TNode, TKeypath, "">;

// prettier-ignore
type _collectPath<
  TCurrentNode extends Node,
  TCurrentKeypath extends string,
  TCurrentPath extends string
> = 
  TCurrentKeypath extends `${infer key extends string}.${infer nextKeypath extends string}`
    ? key extends keyof getChildren<TCurrentNode>
      ? _collectPath<
          getChildren<TCurrentNode>[key],
          nextKeypath,
          Join<TCurrentPath, "/", getPath<TCurrentNode>>
        >
      : never
    : TCurrentKeypath extends keyof getChildren<TCurrentNode>
      ? Join<
          Join<TCurrentPath, "/", getPath<TCurrentNode>>,
          "/",
          getPath<getChildren<TCurrentNode>[TCurrentKeypath]>
        >
      : never;
