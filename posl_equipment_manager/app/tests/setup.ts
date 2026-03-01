import '@testing-library/jest-dom'
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// 各テストの後にクリーンアップを実行
afterEach(() => {
    cleanup();
})

// Next.jsのImageコンポーネントをモック
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Next.js Routerのモック
vi.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: vi.fn(),
      pop: vi.fn(),
      reload: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
      beforePopState: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    }
  },
}))
