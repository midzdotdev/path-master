export type RelativePathMode = 'fs' | 'url'

export const getRelativePathBetween = (
  fromPath: string,
  toPath: string,
  mode: RelativePathMode
) => {
  // URLs completely disregard the last part of the path after the slash
  const normalisedFromPath = (() => {
    if (mode === 'fs' || fromPath.endsWith('/')) {
      return fromPath
    }

    const lastSlashIndex = fromPath.lastIndexOf('/')

    if (lastSlashIndex === -1) {
      return ''
    }

    return fromPath.slice(0, lastSlashIndex)
  })()

  const fromParts = normalisedFromPath.split('/').filter(Boolean)

  const toParts = toPath.split('/').filter(Boolean)

  // determine where the paths diverge
  const firstUncommonPartIndex = fromParts.findIndex((x, i) => x !== toParts[i])
  const firstCommonPartIndex =
    firstUncommonPartIndex === -1 ? fromParts.length : firstUncommonPartIndex

  // get the relative path: from -> common ancestor
  const pathBetweenFromAndCommon = Array.from(
    {
      length: fromParts.length - firstCommonPartIndex,
    },
    () => '..'
  ).join('/')

  // get the relative path: common ancestor -> to
  const pathBetweenCommonAndTo = toParts.slice(firstCommonPartIndex).join('/')

  const combinedPaths = [pathBetweenFromAndCommon, pathBetweenCommonAndTo]
    .filter(Boolean)
    .join('/')

  const isToDir = toPath.endsWith('/')

  // prettier-ignore
  return combinedPaths ?
    isToDir ? `${combinedPaths}/` : combinedPaths :
    isToDir ? "./" : ".";
}
