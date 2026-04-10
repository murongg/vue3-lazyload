import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { libraryEntry, libraryFileName, libraryFormats, libraryName } from './build.config'

export default defineConfig(({ mode }) => {
  const isLibraryBuild = mode === 'lib'

  return {
    plugins: [
      vue(),
      ...(isLibraryBuild
        ? [
            dts({
              entryRoot: 'src',
              exclude: ['example/**/*', 'test/**/*'],
              include: ['src/**/*.ts'],
              insertTypesEntry: false,
              outDir: 'dist',
            }),
          ]
        : []),
    ],
    test: {
      environment: 'happy-dom',
    },
    base: process.env.NODE_ENV === 'production' ? '/' : '/',
    build: isLibraryBuild
      ? {
          lib: {
            entry: libraryEntry,
            fileName: libraryFileName,
            formats: [...libraryFormats],
            name: libraryName,
          },
          outDir: 'dist',
          rollupOptions: {
            external: ['vue'],
            output: {
              exports: 'named',
              globals: {
                vue: 'Vue',
              },
            },
          },
        }
      : {
          outDir: 'example/dist',
        },
  }
})
