import { isDirNode, Node } from './model'
import {
  collectDependencies,
  collectPath,
  getKeypaths,
} from './types/multi-node'
import { getRelativePathBetween, RelativePathMode } from './utils/relative-path'
import { EmptyRecord } from './utils/types'

const traverseToKeypath = (
  model: Node,
  keypath: string,
  callback: (node: Node) => void
): void => {
  let currentNode: Node = model
  callback(currentNode)

  const keys = keypath === '' ? [] : keypath.split('.')

  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    const key = keys[keyIdx]!

    if ('children' in currentNode === false) {
      throw new Error('Attempted to traverse children of a file.')
    }

    if (key in currentNode.children === false) {
      throw new Error(`Key ${key} not found in children.`)
    }

    currentNode = currentNode.children[key]
    callback(currentNode)
  }
}

type DependenciesSpreadArg<TDependencies> = keyof TDependencies extends never
  ? [dependencies?: EmptyRecord]
  : [dependencies: TDependencies]

/**
 * Get the path of a node given a keypath and dependencies.
 *
 * @param model The root node.
 * @param keypath The keypath to traverse.
 * @param dependencies Dependencies, defined when dealing with dynamic paths.
 * @returns The full path of a node.
 */
export const getPath = <
  TModel extends Node,
  TKeypath extends getKeypaths<TModel>,
>(
  model: TModel,
  keypath: TKeypath,
  ...dependencies: DependenciesSpreadArg<collectDependencies<TModel, TKeypath>>
): collectPath<TModel, TKeypath> => {
  const deps = typeof dependencies[0] !== 'object' ? {} : dependencies[0]
  let path = ''

  traverseToKeypath(model, keypath, (node) => {
    const pathSegment =
      typeof node.path === 'string' ? node.path : node.path(deps)

    if (isDirNode(node)) {
      path += `${pathSegment}/`
      return
    }

    path += pathSegment
  })

  return path as collectPath<TModel, TKeypath>
}

type KeypathWithDependenciesArg<
  TKeypath extends string,
  TDependencies,
> = keyof TDependencies extends never
  ? TKeypath | [keypath: TKeypath, dependencies?: EmptyRecord]
  : [keypath: TKeypath, dependencies: TDependencies]

const normaliseKeypathWithDependenciesArg = <
  TKeypath extends string,
  TDependencies,
>(
  arg: KeypathWithDependenciesArg<TKeypath, TDependencies>
): { keypath: TKeypath; dependencies: TDependencies } => {
  if (typeof arg === 'string') {
    return { keypath: arg as any, dependencies: {} as TDependencies }
  }

  return { keypath: arg[0], dependencies: arg[1] as TDependencies }
}

interface GetRelativePathFn {
  <
    TModel extends Node,
    TKeypathFrom extends getKeypaths<TModel>,
    TKeypathTo extends getKeypaths<TModel>,
  >(
    model: TModel,
    from: KeypathWithDependenciesArg<
      TKeypathFrom,
      collectDependencies<TModel, TKeypathFrom>
    >,
    to: KeypathWithDependenciesArg<
      TKeypathTo,
      collectDependencies<TModel, TKeypathTo>
    >
  ): string
}

const _getRelativePath =
  (mode: RelativePathMode): GetRelativePathFn =>
  (model, from, to) => {
    const normFrom = normaliseKeypathWithDependenciesArg(from)
    const normTo = normaliseKeypathWithDependenciesArg(to)

    const fromPath = getPath(model, normFrom.keypath, normFrom.dependencies)
    const toPath = getPath(model, normTo.keypath, normTo.dependencies)

    return getRelativePathBetween(fromPath, toPath, mode)
  }

/**
 * Get the relative path between two nodes for use in URLs.
 *
 * @param model The root node.
 * @param from The keypath of the source node or a tuple of `[keypath,
 *   dependencies]` if requiring dependencies.
 * @param to The keypath of the destination node or a tuple of `[keypath,
 *   dependencies]` if requiring dependencies.
 * @returns The relative path between the two nodes.
 */
export const getRelativeUrlPath: GetRelativePathFn = _getRelativePath('url')

/**
 * Get the relative path between two nodes for use with the filesystem.
 *
 * @param model The root node.
 * @param from The keypath of the source node or a tuple of `[keypath,
 *   dependencies]` if requiring dependencies.
 * @param to The keypath of the destination node or a tuple of `[keypath,
 *   dependencies]` if requiring dependencies.
 * @returns The relative path between the two nodes.
 */
export const getRelativeFsPath: GetRelativePathFn = _getRelativePath('fs')
