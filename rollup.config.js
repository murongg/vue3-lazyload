/* eslint-disable no-console */
const path = require('path')
const fs = require('fs')
const rollup = require('rollup')
const { babel } = require('@rollup/plugin-babel')
const { uglify } = require('rollup-plugin-uglify')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const typescript = require('@rollup/plugin-typescript')
const version = require('./package.json').version

const banner
  = '/*!\n'
  + ` * Vue3-Lazyload.js v${version}\n`
  + ' * A Vue3.x image lazyload plugin' + '\n'
  + ` * (c) ${new Date().getFullYear()} MuRong <admin@imuboy.cn>\n`
  + ' * Released under the MIT License.\n'
  + ' */\n'

const external = [
  'vue',
  '@vue/composition-api',
]

const commonPlugin = [
  commonjs(),
  babel(),
  typescript(),
  nodeResolve(),
]

async function build(options, outputOptions) {
  try {
    const bundle = await rollup.rollup(options)
    const { output } = await bundle.generate({
      format: outputOptions.format,
      name: 'VueLazyload',
    })
    exists()
    await write(path.resolve(__dirname, outputOptions.filename), output[0].code)
  }
  catch (e) {
    console.error(e)
  }
}

function getSize(code) {
  return `${(code.length / 1024).toFixed(2)}kb`
}

function blue(str) {
  return `\x1B[1m\x1B[34m${str}\x1B[39m\x1B[22m`
}

function write(dest, code) {
  return new Promise((resolve, reject) => {
    code = banner + code
    fs.writeFile(dest, code, (err) => {
      if (err)
        return reject(err)
      console.log(`${blue(dest)} ${getSize(code)}`)
      resolve()
    })
  })
}

function exists() {
  const pathE = path.resolve(__dirname, 'dist/')
  if (!fs.existsSync(pathE))
    fs.mkdirSync(pathE)
}

build({
  input: path.resolve(__dirname, 'src/index.ts'),
  plugins: [
    ...commonPlugin,
    uglify(),
  ],
  external,
}, {
  format: 'umd',
  filename: 'dist/index.min.js',
})

