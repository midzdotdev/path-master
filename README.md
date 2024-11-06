# path-master

[![JSR](https://jsr.io/badges/@midzdotdev/path-master)](https://jsr.io/@midzdotdev/path-master)
[![Release Workflow](https://github.com/midzdotdev/path-master/actions/workflows/release.yml/badge.svg)](https://github.com/midzdotdev/path-master/actions/workflows/release.yml)

`path-master` is a TypeScript library that simplifies working with dynamic file structures.

You can think of `path-master` as providing structure to files in the same way that JSON provides structure to data.

Path Master provides a whole host of benefits:

- 🏡 **Centralised:** a single source of truth for defining paths
- 🧬 **Consistent:** standardises your path generation
- ✨ **Type-safe:** parameters are typed, and path types are inferred
- 📊 **Parameterised:** paths are as dynamic as you need
- 📈 **Incremental:** model a complete file structure or just parts of it

> This library does not modify any filesystem directly,
> it's solely for modelling and generating paths.

The applications for this are endless, but commonly useful with:

- 💾 **Local Filesystem:** for local storage (e.g. via Node.js `fs` module)
- ☁️ **S3 Buckets:** for remote storage in the cloud
- 🧭 **Origin Private File System:** for local storage in web apps
- 🌎 **Relative URLs:** between resources on the web

## Introduction

Making storage paths in any language is a painful process.

Any application that persists data requires specifying paths for how it should be structured. Previously this involved working with lots of template strings, one for each path. These would probably be copied around your codebase to be used multiple times.

If you're smart, then you'd make a helper function for each path, typing the function parameters with the parameterised parts of the path. Each of these functions has to assume a root for the path if it's relative, or might give absolute paths.

If one of these helper functions gives relative paths, you've got to join the result by prepending a parent path before you can use it.

It's a lot to think about, and if you've ever dealt with complex file structures, you'll know it can get very messy very quickly.

`path-master` aims to solve all these problems. It provides you with the ability to model a file structure as a tree of directories and files, so you can easily and safely get the paths you need.

## Installation

Make sure to install the `@midzdotdev/path-master` package from [JSR](https://jsr.io/@midzdotdev/path-master).

## Conceptualising Models

In order to generate paths, we need to model the shape of our file structure. Before diving straight into the code, let's make sure we understand this kind of modelling as a concept.

As an example, we're going to be modelling a collection of HTTP Live Streaming (HLS) video packages.

In our HLS package, there are playlists (`.m3u8`) and video segments (`.ts`). We have a master playlist defining the available variants, and each of those variants has a number of video segments and a playlist to index them.

<p id="psuedo-model">The following is our psuedo-model to understand what we're aiming for.</p>

```
.
└── videos
    └── [videoId]
        ├── master.m3u8
        └── stream_[quality]
            ├── playlist.m3u8
            └── segment_[segmentId].ts
```

> As you're probably already aware, a file structure is a tree of file and directory nodes. Later on you'll notice that our model definition in code follows the exact same shape.

Notice the square brackets above (`[]`), where we've parameterised the parts of the paths that are variable.

The name of the `videos` directory is static so there will only be one, but there could be any number of directories within `videos` because of the parameterised `[videoId]` part. The same idea applies to the `master.m3u8` and `segment_[segmentId].ts` files.

In `path-master`, these parameters are referred to as _dependencies_ and are always named so that when we generate paths, we know what value to use for each parameterised part of the path.

The following table gives us some examples of concrete paths for different nodes in the tree, each with the required dependencies.

| Target Node              | Dependencies                                   | Path                                 |
| ------------------------ | ---------------------------------------------- | ------------------------------------ |
| `[videoId]`              | `{ videoId: 42 }`                              | `videos/42/`                         |
| `master.m3u8`            | `{ videoId: 42 }`                              | `videos/42/master.m3u8`              |
| `stream_[quality]`       | `{ videoId: 42, quality: 720 }`                | `videos/42/stream_720/`              |
| `playlist.m3u8`          | `{ videoId: 42, quality: 720 }`                | `videos/42/stream_720/playlist.m3u8` |
| `segment_[segmentId].ts` | `{ videoId: 42, quality: 720, segmentId: 11 }` | `videos/42/stream_720/segment_11.ts` |

> Note that the path is relative to the root of the model (represented by `.` [in the psuedo-model](#psuedo-model)).

Hopefully now modelling a file structure make sense as a concept. Let's move onto the code.

## Create a Model

The library exposes two helper functions `file` and `dir` for us to build our model.

Both of these start with a _path_ parameter, which behaves identically between the two.

The path can be either:

- **static** as a plain string, or
- **dynamic** as a callback with a _dependencies_ param

```ts
const staticFile = file('foo.ext')

const dynamicFile = file(
  ({ myParam }: { myParam: string }) => `foo_${myParam}.ext`
)
```

> You have to type dependencies manually and they must be assignable to `Record<string, any>`.
>
> Keep in mind that values interpolated in a template string must be serialisable, and non-primitives can serialise in strange ways. For example, interpolating an object like `` `${someObject}` `` gives `'[object Object]'` as the resultant string.

The `dir` modelling function has an additional parameter `children` so you can recursively nest directories and files inside it.

```ts
const myDir = dir('my_dir', {
  staticFile,
})

const deepDir = dir('deep_dir', {
  surfaceFile: file('foo.ext'),
  level1: dir('level_1', {
    level2: dir('level_2', {
      deepFile: file('bar.ext'),
    }),
  }),
})
```

### Example: Modelling our HLS package

Let's fully model [our original example](#psuedo-model).

Here is the desired psuedo-model copied for convenience:

```
.
└── videos
    └── [videoId]
        ├── master.m3u8
        └── stream_[quality]
            ├── playlist.m3u8
            └── segment_[segmentId].ts
```

Using our `dir` and `file` modelling functions, we can define our model:

```ts
import { dir, file } from '@midzdotdev/path-master'

const hlsPackageModel = dir(
  ({ videoId }: { videoId: number }) => `videos/${videoId}`,
  {
    manifest: file(`master.m3u8`),
    variantStream: dir(
      ({ quality }: { quality: 720 | 1080 }) => `stream_${quality}`,
      {
        playlist: file(`playlist.m3u8`),
        segment: file(
          ({ segmentId }: { segmentId: number }) => `segment_${segmentId}.ts`
        ),
      }
    ),
  }
)
```

The path of a node in the model can span across multiple directories (e.g. `videos/${videoId}` above).
This can help to produce a more concise model when dealing with deeply nested structures.

### Abstracting large models

If you're working with a very large model, it might be clearer to define parts of a model separately, then join them together into one main model.

If all the parts are together in a single file, then you can `export` the main model to remove any ambiguity about which model should be used in other parts of your application.

Ideally a model should fully describe the structure of a storage destination. This way your model's root aligns with the storage's root and the paths given by `path-master` can be used directly as absolute paths.

## Getting Paths

Now that we have a model, let's address the reason that we're here in the first place! Let's get some paths.

We can generate paths by calling the `getPath` function.

```ts
declare const getPath: (
  model: FileNode | DirNode,
  keypath: string,
  dependencies: {}
) => string
```

The parameters are:

- _model_: the model
- _keypath_: a string to define which node we're getting the path for
- _dependencies_: an object with all the dependencies from the node and it's ancestors

```ts
import { dir, file, getPath } from '@midzdotdev/path-master'

const hlsPackageModel = dir(
  ({ videoId }: { videoId: number }) => `videos/${videoId}`,
  {
    manifest: file(`master.m3u8`),
    variantStream: dir(
      ({ quality }: { quality: 720 | 1080 }) => `stream_${quality}`,
      {
        playlist: file(`playlist.m3u8`),
        segment: file(
          ({ segmentId }: { segmentId: number }) => `segment_${segmentId}.ts`
        ),
      }
    ),
  }
)

const hlsPackagePath = getPath(hlsPackageModel, '', { videoId: 42 })
// result: "videos/42/"
// type: `videos/${number}`

const streamPlaylist = getPath(hlsPackageModel, 'variantStream.playlist', {
  videoId: 42,
  quality: 720,
})
// result: "videos/42/stream_720/playlist.m3u8"
// type: `videos/${number}/stream_${number}/playlist.m3u8`

const segment11 = getPath(hlsPackageModel, 'variantStream.segment', {
  videoId: 42,
  quality: 720,
  segmentId: 11,
})
// result: "videos/42/stream_720/segment_11.ts"
// type: `videos/${number}/stream_${number}/segment_${number}.ts`
```

> Notice that the type of the path is properly inferred from the model definition.

## Getting Relative Paths

You can get relative paths between nodes, so long as they're in the same model.

It's important to recognise that relative paths behave differently in URLs as opposed to filesystem-like paths.

The relative path from `a/b` to `a/c/d`:

- in a filesystem is `../c/d`
- in a URL is `c/d`

> Have a play around with this yourself to better understand the difference.
>
> - Use the Node REPL with `path.relative(from, to)` for filesystem paths
> - Use the browser console with `new URL(relativePath, fromUrl)` for URL paths

As a result we have two separate functions for each use-case:

- filesystem paths: `getRelativeFsPath`
- URL paths: `getRelativeUrlPath`

Both of these functions have an identical signature.

```ts
declare const x: (
  model: FileNode | DirNode,
  from: string | [keypath: string, dependencies: {}],
  to: string | [keypath: string, dependencies: {}]
) => string
```

> If the node specified by _from_ or _to_'s keypath does not require dependencies, then you can just pass the keypath string.

Since our example model being a HLS package only concerns itself with URLs, we'll demonstrate with `getRelativeUrlPath`.

```ts
import { dir, file, getRelativeUrlPath } from '@midzdotdev/path-master'

const hlsPackageModel = dir(
  ({ videoId }: { videoId: number }) => `videos/${videoId}`,
  {
    manifest: file(`master.m3u8`),
    variantStream: dir(
      ({ quality }: { quality: 720 | 1080 }) => `stream_${quality}`,
      {
        playlist: file(`playlist.m3u8`),
        segment: file(
          ({ segmentId }: { segmentId: number }) => `segment_${segmentId}.ts`
        ),
      }
    ),
  }
)

const masterPlaylistToVariantPlaylist = getRelativeUrlPath(
  hlsPackageModel,
  ['variantStream.playlist', { videoId: 42, quality: 720 }],
  ['variantStream.segment', { videoId: 42, quality: 720, segmentId: 11 }]
)
// result: "stream_720/playlist.m3u8"

const variantPlaylistToSegment = getRelativeUrlPath(
  hlsPackageModel,
  ['variantStream.playlist', { videoId: 42, quality: 720 }],
  ['variantStream.segment', { videoId: 42, quality: 720, segmentId: 11 }]
)
// result: "segment_11.ts"
```

## Contributing

If you have any ideas for improvements or new features, please file an issue or open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
