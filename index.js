const fs = require('fs')
const path = require('path')
const nsg = require('node-sprite-generator')

function listDirs(dirs, allowedExts) {
  const allowedExts_ = allowedExts.reduce((acc, e) => {
    acc[e] = true
    return acc
  }, {})

  return dirs
    .filter(p => {
      try {
        return fs.lstatSync(p).isDirectory()
      } catch (e) {
        return false
      }
    })
    .reduce((acc, p) => {
      const f = fs.readdirSync(p)
        .map(n => path.join(p, n))
        .filter(n => allowedExts_[path.extname(n)])
        .filter(p => fs.lstatSync(p).isFile())

      return [...acc, ...f]
    }, [])
}

function textureMergerStyle(layout, stylesheetPath, spritePath, options, cb) {
  const payload = {
    file: spritePath,
    frames: layout.images.reduce((acc, image) => {
      const basename = path.basename(image.path)
      const ext = path.extname(basename)
      const name = basename.substring(0, basename.length - ext.length)
      acc[name] = {
        x: image.x,
        y: image.y,
        w: image.width,
        h: image.height,
        offX: 0,
        offY: 0,
        sourceW: image.width,
        sourceH: image.height,
      }

      return acc
    }, {})
  }
  const payloadStr = JSON.stringify(payload, null, 2)

  fs.writeFile(stylesheetPath, payloadStr, cb)
}

function packFiles(files, output, optsOrCb, cb) {
  if (typeof optsOrCb === 'function') {
    cb = optsOrCb
    optsOrCb = {}
  }

  const nsgOpts = {
    layout: 'packed',
    ...optsOrCb,
    src: files,
    spritePath: `${output}.png`,
    stylesheetPath: `${output}.json`,
    stylesheet: textureMergerStyle,
  }

  nsg(nsgOpts, cb)
}

module.exports = {
  listDirs,
  packFiles,
}
