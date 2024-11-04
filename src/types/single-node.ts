import { DirNode, FileNode, Node } from "~/model";

// prettier-ignore
export type getDependencies<TNode extends Node> =
  TNode extends DirNode<infer TDependencies>
    ? TDependencies
    : TNode extends FileNode<infer TDependencies>
      ? TDependencies
      : never;

// prettier-ignore
export type getChildren<TNode extends Node> =
  TNode extends DirNode<any, any, infer TChildren>
    ? TChildren
    : {};

// prettier-ignore
export type getPath<TNode extends Node> =
  TNode extends DirNode<any, infer TPath>
    ? TPath
    : TNode extends FileNode<any, infer TPath>
      ? TPath
      : never;
