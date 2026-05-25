import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
    test: {
        // JSDOMを使用してブラウザ環境をシミュレート
        environment: 'jsdom',
        // セットアップファイルの指定
        setupFiles: './app/tests/setup.ts',
        // テストファイルのパターン
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        // 除外するファイル/フォルダ
        exclude: ['node_modules', 'dist', '.next', 'coverage'],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./app"),
        }
    }
});
