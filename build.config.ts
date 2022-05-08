import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/hooks',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
