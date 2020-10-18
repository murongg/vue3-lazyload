const rollup = require('rollup')
const path = require('path')
const fs = require('fs')
const { babel } = require('@rollup/plugin-babel')
const { uglify } = require('rollup-plugin-uglify')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const typescript = require('@rollup/plugin-typescript')
const version = process.env.VERSION || require('./package.json').version
const name = 'vue3-lazyload'
const banner =
    '/*!\n' +
    ' * Vue3-Lazyload.js v' + version + '\n' +
    ' * A Vue3.x image lazyload plugin' + '\n' + 
    ' * (c) ' + new Date().getFullYear() + ' MuRong <admin@imuboy.cn>\n' +
    ' * Released under the MIT License.\n' +
    ' */\n'

async function build(options, outputOptions) {
  try {
    const bundle = await rollup.rollup(options)
    let { output } = await bundle.generate({
      format: outputOptions.format,
      name: 'VueLazyload'
    })
    exists()
    await write(path.resolve(__dirname, outputOptions.filename), output[0].code)
  } catch (e) {
    console.error(e)
  }
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}

function write(dest, code) {
  return new Promise(function (resolve, reject) {
    code = banner + code
    fs.writeFile(dest, code, function (err) {
      if (err) return reject(err)
      console.log(blue(dest) + ' ' + getSize(code))
      resolve()
    })
  })
}

function exists() {
  const pathE = path.resolve(__dirname, 'dist/')
  if (!fs.existsSync(pathE)) {
    fs.mkdirSync(pathE)
  }
}

build({
  input: path.resolve(__dirname, 'src/index.ts'),
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({ babelHelpers: true }),
    typescript()
  ]
}, {
  format: 'umd',
  filename: `dist/${name}.js`
})

build({
  input: path.resolve(__dirname, 'src/index.ts'),
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({ babelHelpers: true }),
    typescript(),
    uglify()
  ]
}, {
  format: 'umd',
  filename: `dist/${name}.min.js`
})

build({
  input: path.resolve(__dirname, 'src/index.ts'),
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({ babelHelpers: true }),
    typescript(),
  ]
}, {
  format: 'es',
  filename: `dist/${name}.esm.js`
})
