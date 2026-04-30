import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    root: '.',
    esbuild: {
        target: 'es2017',
    },
    server: {
        port: 5173,
        host: 'localhost',
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        outDir: 'public/build',
        emptyOutDir: true,
        target: 'es2017',
    },
});
