// import react from '@vitejs/plugin-react'
// import { defineConfig } from 'vite'
// import path from 'path'

// export default defineConfig({
//     plugins: [react()],
//     resolve: {
//         alias: {
//             '@': path.resolve(__dirname, './src'),
//             '@hooks': path.resolve(__dirname, './src/hooks'),
//             '@services': path.resolve(__dirname, './src/services')
//         }
//     },
//     server: {
//         port: 3000,
//         open: true,
//     },
//     build: {
//         outDir: 'dist',
//         assetsDir: 'assets',
//         sourcemap: true,
//         rollupOptions: {
//             output: {
//                 manualChunks: undefined
//             }
//         }
//     },
//     base: process.env.NODE_ENV === 'production' ? '/restaurant-management-system/' : '/',
// })


import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@services': path.resolve(__dirname, './src/services')
        }
    },
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    },
    base: '/'
})