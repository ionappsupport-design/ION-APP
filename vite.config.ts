import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import vitePluginJavascriptObfuscator from 'vite-plugin-javascript-obfuscator';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      // mode === 'production' && vitePluginJavascriptObfuscator({
      //   include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
      //   exclude: [/node_modules/],
      //   apply: 'build',
      //   options: {
      //     compact: true,
      //     controlFlowFlattening: false,
      //     deadCodeInjection: false,
      //     debugProtection: false,
      //     disableConsoleOutput: false,
      //     selfDefending: false,
      //     simplify: true,
      //     stringArray: true,
      //     stringArrayEncoding: ['base64'],
      //   }
      // })
    ],
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
