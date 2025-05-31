import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'

export default defineConfig(() => {
  return {
    base: './',
    build: {
      chunkSizeWarningLimit: 1000,
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: undefined,
          // manualChunks: {
          //   // Split out react related modules into a separate chunk
          //   react: ['react', 'react-dom'],
          //   // Split out other vendor modules into a separate chunk
          //   redux: ['redux', 'react-redux'],
          //   formik: ['formik', 'yup'],
          //   // firebase: ['firebase'],
          //   coreui: [
          //     '@coreui/chartjs',
          //     '@coreui/coreui',
          //     '@coreui/icons',
          //     '@coreui/icons-react',
          //     '@coreui/react',
          //     '@coreui/react-chartjs',
          //     '@coreui/utils',
          //   ],
          //   chartjs: ['chart.js'],
          //   ui: [
          //     'react-bootstrap',
          //     'react-datepicker',
          //     'react-easy-crop',
          //     'react-toastify',
          //     'react-social-login-buttons',
          //   ], // Split out utility libraries into a separate chunk
          //   utils: [
          //     'classnames',
          //     'core-js',
          //     'dotenv',
          //     'prop-types',
          //     'simplebar-react',
          //     '@popperjs/core',
          //   ],
          // },
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    server: {
      watch: { usePolling: true },
      host: true, // needed for Docker container port mapping to work
      strictPort: true,
      port: 4000, // you can replace this port with any port
    },
  }
})
