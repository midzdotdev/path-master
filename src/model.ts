import { EmptyRecord } from "~/utils/types";

type Path<TDependencies, TPathName extends string> =
  | TPathName
  | ((dependencies: TDependencies) => TPathName);

export interface FileNode<
  TDependencies = any,
  TPathName extends string = string
> {
  path: Path<TDependencies, TPathName>;
}

export interface DirNode<
  TDependencies = any,
  TPathName extends string = string,
  TChildren = any
> {
  path: Path<TDependencies, TPathName>;
  children: TChildren;
}

export type Node = FileNode<any, string> | DirNode<any, string, any>;

// prettier-ignore
type PathArg<TDependencies, TPathName extends string> =
  [TPathName] extends [""]
    ? 'Error: Pathnames cannot be empty.'
    : unknown extends TDependencies
      ? TPathName
      : keyof TDependencies extends never
        ? 'Error: Dependencies should not be empty.'
        : ((dependencies: TDependencies) => TPathName);

// prettier-ignore
type ChildrenArg<TChildren> =
  TChildren extends EmptyRecord
    ? TChildren
    : Exclude<keyof TChildren, string> extends never
      ? [TChildren[keyof TChildren]] extends [Node]
        ? TChildren
        : "Error: Children must only have Nodes as values."
      : "Error: Children should only have string keys.";

export const file = <TDependencies, TPathName extends string>(
  path: PathArg<TDependencies, TPathName>
): FileNode<TDependencies, TPathName> =>
  ({ path } as FileNode<TDependencies, TPathName>);

export const dir = <TDependencies, const TPathName extends string, TChildren>(
  path: PathArg<TDependencies, TPathName>,
  children: ChildrenArg<TChildren>
): DirNode<TDependencies, TPathName, TChildren> =>
  ({ path, children } as DirNode<TDependencies, TPathName, TChildren>);

export const isFileNode = (node: Node): node is FileNode =>
  "children" in node === false;

export const isDirNode = (node: Node): node is DirNode =>
  "children" in node === true;

export const getNodeType = (node: Node): "file" | "dir" =>
  isFileNode(node) ? "file" : "dir";
