import { EmptyRecord } from './utils/types'

type Path<TDependencies, TPathName extends string> =
  | TPathName
  | ((dependencies: TDependencies) => TPathName)

/** Represents a file node when modelling as given by {@link file}. */
export interface FileNode<
  TDependencies = any,
  TPathName extends string = string,
> {
  path: Path<TDependencies, TPathName>
}

/** Represents a directory node when modelling as given by {@link dir}. */
export interface DirNode<
  TDependencies = any,
  TPathName extends string = string,
  TChildren = any,
> {
  path: Path<TDependencies, TPathName>
  children: TChildren
}

export type Node = FileNode<any, string> | DirNode<any, string, any>

// prettier-ignore
type PathArg<TDependencies, TPathName extends string> =
  [TPathName] extends [""]
    ? 'Error: Pathnames cannot be empty.'
    : unknown extends TDependencies
      ? TPathName
      : keyof TDependencies extends never
        ? 'Error: Dependencies should not be empty.'
        : ((dependencies: TDependencies) => TPathName)

// prettier-ignore
type ChildrenArg<TChildren> =
  TChildren extends EmptyRecord
    ? TChildren
    : Exclude<keyof TChildren, string> extends never
      ? [TChildren[keyof TChildren]] extends [Node]
        ? TChildren
        : "Error: Children must only have Nodes as values."
      : "Error: Children should only have string keys."

/**
 * Creates a file node for modelling.
 *
 * @param path The path segment of the file node (including extension).
 * @returns A file node.
 * @see {@link https://jsr.io/@midzdotdev/path-master#create-a-model}
 */
export const file = <TDependencies, TPathName extends string>(
  path: PathArg<TDependencies, TPathName>
): FileNode<TDependencies, TPathName> =>
  ({ path }) as FileNode<TDependencies, TPathName>

/**
 * Creates a directory node for modelling.
 *
 * @param path The path segment of the directory node (excluding trailing
 *   slash).
 * @param children The file and directory nodes within this directory.
 * @returns A directory node.
 * @see {@link https://jsr.io/@midzdotdev/path-master#create-a-model}
 */
export const dir = <TDependencies, const TPathName extends string, TChildren>(
  path: PathArg<TDependencies, TPathName>,
  children: ChildrenArg<TChildren>
): DirNode<TDependencies, TPathName, TChildren> =>
  ({ path, children }) as DirNode<TDependencies, TPathName, TChildren>

export const isFileNode = (node: Node): node is FileNode =>
  'children' in node === false

export const isDirNode = (node: Node): node is DirNode =>
  'children' in node === true

export const getNodeType = (node: Node): 'file' | 'dir' =>
  isFileNode(node) ? 'file' : 'dir'
