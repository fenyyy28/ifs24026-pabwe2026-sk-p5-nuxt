[IO.File]::WriteAllText((Join-Path $PWD "README.md"), @'
# Delcom Cash Flow (Nuxt 4)

Aplikasi pencatatan arus kas pribadi berbasis [Delcom Open API](https://open-api.delcom.org/docs/1.0/api-cash-flows).
Dibangun dengan Nuxt 4 (SPA, `ssr: false`), TypeScript, Pinia, Tailwind CSS v4, dan Bun.

## Prasyarat

- [Bun](https://bun.sh)
- **Node.js 22 atau 24 (LTS)**. Node 26 menyebabkan galat `Either manifest or precomputed data must be provided`.

## Menjalankan

```bash
bun install
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
bun run dev              # mode pengembangan
bun start                # build lalu preview (bun start --no-build untuk melewati build)
```

Variabel lingkungan (`.env`):

| Variabel | Fungsi |
|---|---|
| `VITE_DELCOM_BASEURL` | URL dasar API, misalnya `https://open-api.delcom.org/api/v1` |
| `APP_PORT` | Port server dev dan preview (default 3000) |

## Pengujian

```bash
bun run test            # jalankan seluruh test
bun run test:coverage   # test + laporan coverage (ambang 100%)
bun run typecheck       # pemeriksaan tipe
```

Konfigurasi Vitest berada di `vitest.config.ts`. Nama ini sengaja berbeda dari `vite.config.ts`
karena Nuxt 4 menolak berkas konfigurasi Vite eksternal di root proyek (galat `NUXT_B5004`).

## Struktur