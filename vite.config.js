// 내 집 예산 계산기 — 빌드 설정
// © 2026 티쳐무 · 모든 권리 보유
//
// 빌드 결과는 `dist/index.html` 한 파일이어야 한다(바깥 자원 0개, 더블클릭 실행).
// 합치는 일은 의존성을 늘리지 않으려고 `tools/inline.mjs` 가 빌드 뒤에 직접 한다.
import { defineConfig } from 'vite';

// `/*!` 로 시작해야 압축 뒤에도 살아남는다 (legalComments: 'inline' 과 함께).
const 배너 = '/*! 내 집 예산 계산기 · © 2026 티쳐무 · 모든 권리 보유 */';

export default defineConfig({
  // 깃허브 페이지 하위 경로에서도 열리도록 상대 경로를 쓴다.
  base: './',
  esbuild: {
    // 'none' 으로 두면 `/*!` 배너까지 지워진다.
    legalComments: 'inline',
  },
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: {
      output: {
        banner: 배너,
        inlineDynamicImports: true,
      },
    },
  },
});
