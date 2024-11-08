import { EmptyRecord } from './utils/types'

type Path<TDependencies, TPathname extends string> =
  | TPathname
  | ((dependencies: TDependencies) => TPathname)

/** Represents a file node when modelling as given by {@link file}. */
export interface FileNode<
  in TDependencies = any,
  out TPathname extends string = string,
> {
  path: Path<TDependencies, TPathname>
}

/** Represents a directory node when modelling as given by {@link dir}. */
export interface DirNode<
  in TDependencies = any,
  out TPathname extends string = string,
  out TChildren = any,
> {
  path: Path<TDependencies, TPathname>
  children: TChildren
}

export type Node = FileNode<any, string> | DirNode<any, string, any>

// prettier-ignore
type PathArg<TDependencies, TPathname extends string> =
  [TPathname] extends [""]
    ? 'Error: Pathnames cannot be empty.'
    : unknown extends TDependencies
      ? TPathname
      : keyof TDependencies extends never
        ? 'Error: Dependencies should not be empty.'
        : ((dependencies: TDependencies) => TPathname)

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
export const file = <TDependencies, TPathname extends string>(
  path: PathArg<TDependencies, TPathname>
): FileNode<TDependencies, TPathname> =>
  ({ path }) as FileNode<TDependencies, TPathname>

/**
 * Creates a directory node for modelling.
 *
 * @param path The path segment of the directory node (excluding trailing
 *   slash).
 * @param children The file and directory nodes within this directory.
 * @returns A directory node.
 * @see {@link https://jsr.io/@midzdotdev/path-master#create-a-model}
 */
export const dir = <TDependencies, const TPathname extends string, TChildren>(
  path: PathArg<TDependencies, TPathname>,
  children: ChildrenArg<TChildren>
): DirNode<TDependencies, TPathname, TChildren> =>
  ({ path, children }) as DirNode<TDependencies, TPathname, TChildren>

export const isFileNode = (node: Node): node is FileNode =>
  'children' in node === false

export const isDirNode = (node: Node): node is DirNode =>
  'children' in node === true

export const getNodeType = (node: Node): 'file' | 'dir' =>
  isFileNode(node) ? 'file' : 'dir'
