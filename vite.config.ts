import { defineConfig } from 'vite';

export default defineConfig({
    base: '/',
    root: 'src',
    publicDir: 'public',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true,
    },
    server: {
        port: 3000,
        open: true,
    },
}); 