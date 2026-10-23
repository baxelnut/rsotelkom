# Dashboard RSO Telkom

Dashboard internal untuk Telkom Indonesia Regional 3. Proyek ini menggunakan monorepo TypeScript yang mencakup frontend React dan backend Express dalam satu repositori, serta diakses melalui satu domain produksi.

## Teknologi yang digunakan

| Lapisan  | Teknologi                               |
| -------- | --------------------------------------- |
| Frontend | React, TypeScript, Vite                 |
| Backend  | Node.js, Express, TypeScript            |
| Shared   | Type & constants TypeScript             |
| Tooling  | npm workspaces, tsx (dev), tsup (build) |

## Struktur repositori

```text
.
├── apps/
│   ├── api/                 # Backend Express (@rso/api)
│   │   └── src/index.ts
│   └── web/                 # Frontend React (@rso/web)
│       └── src/
│           ├── app/         # Kerangka aplikasi dan routing
│           ├── components/  # Feedback, layout, tabel, UI
│           ├── contexts/
│           ├── data/
│           ├── domain/
│           ├── hooks/
│           └── pages/       # 404, admin, autentikasi, ikhtisar, laporan, pengaturan
├── packages/
│   └── shared/              # Tipe yang digunakan bersama oleh web dan API (@rso/shared)
├── tsconfig.base.json       # Opsi compiler TypeScript bersama
├── .env.example
└── package.json             # Konfigurasi root workspace
```

## Prasyarat

- Node.js version 20 or newer
- npm version 10 or newer

## Memulai pengembangan

```bash
# 1. Instal seluruh dependensi workspace dari root repositori
npm install

# 2. Buat file konfigurasi environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Jalankan frontend dan backend secara bersamaan
npm run dev
```

| Layanan  | URL                                            |
| -------- | ---------------------------------------------- |
| Frontend | [http://localhost:5173](http://localhost:5173) |
| Backend  | [http://localhost:3000](http://localhost:3000) |

Dalam lingkungan pengembangan, Vite meneruskan setiap permintaan `/api/*` ke backend. Dengan demikian, frontend selalu menggunakan URL relatif, seperti `/api/health`. Konfigurasi CORS tidak diperlukan dan tidak ada host yang ditulis secara hardcoded.

## Skrip

Jalankan seluruh perintah berikut dari root repositori.

| Perintah            | Deskripsi                                             |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Menjalankan web dan API secara bersamaan              |
| `npm run dev:web`   | Menjalankan frontend saja                             |
| `npm run dev:api`   | Menjalankan backend saja                              |
| `npm run build`     | Membangun frontend, kemudian backend                  |
| `npm run start`     | Menjalankan server produksi yang melayani web dan API |
| `npm run typecheck` | Memeriksa tipe TypeScript di seluruh workspace        |
| `npm run lint`      | Memeriksa kualitas kode frontend                      |

## Variabel lingkungan

**`apps/api/.env`**

| Variabel   | Deskripsi                                        | Nilai default |
| ---------- | ------------------------------------------------ | ------------- |
| `PORT`     | Port yang digunakan server                       | `3000`        |
| `NODE_ENV` | Mode lingkungan, `development` atau `production` | `development` |

**`apps/web/.env`**

Hanya variabel dengan awalan `VITE_` yang dapat diakses oleh browser. Jangan menyimpan informasi rahasia atau kredensial sensitif dalam file ini.

## Paket bersama

`@rso/shared` menyimpan tipe dan konstanta yang digunakan oleh kedua aplikasi, misalnya struktur respons API. Definisikan tipe satu kali, kemudian impor pada frontend maupun backend.

```ts
import type { ApiResponse } from "@rso/shared";
```

Paket ini digunakan langsung dari kode sumber TypeScript. Vite dan tsx mengompilasinya secara langsung saat dibutuhkan, sedangkan proses build produksi menyertakannya ke dalam hasil build API.

## Lingkungan produksi

Lingkungan produksi menggunakan satu domain dan satu proses server.

1. `npm run build` membangun frontend ke dalam `apps/web/dist` dan mengemas backend ke dalam `apps/api/dist`.
2. `npm run start` menjalankan server Express yang:
   - Menangani rute API di bawah `/api/*`.
   - Menyajikan frontend hasil build sebagai file statis.
   - Mengarahkan permintaan ke rute lain ke `index.html`, sehingga client-side routing, termasuk akses langsung ke URL halaman tertentu, tetap berfungsi.

Jika aplikasi ditempatkan di belakang Nginx atau reverse proxy lainnya, arahkan domain ke port Node.js dan teruskan seluruh jalur permintaan ke server tersebut.

Sebagai alternatif, Nginx dapat menyajikan `apps/web/dist` secara langsung dan hanya meneruskan permintaan `/api` ke Node.js.

### Migrasi dari domain terpisah

Peralihan dari dua domain menjadi satu domain memengaruhi beberapa aspek berikut:

- Konfigurasi CORS, yang tidak lagi diperlukan untuk permintaan dari origin yang sama.
- Cakupan cookie dan pengaturan `SameSite`.
- URI pengalihan SSO/OAuth serta URL yang diizinkan (_allowlist_) di sisi Telkom.
- Aturan firewall atau gateway.

Pertahankan domain lama tetap aktif secara paralel selama proses migrasi. Verifikasi penerapan pada domain baru terlebih dahulu, kemudian lakukan pengalihan dari domain lama.

## Konvensi pengembangan

- Kode frontend mengakses API menggunakan URL relatif, seperti `/api/...`.
- Tipe yang digunakan bersama disimpan di `packages/shared` dan tidak diduplikasi di antara aplikasi.
- Setiap aplikasi menyimpan informasi rahasianya dalam file `.env` masing-masing.
- File `.env` tidak boleh dimasukkan ke repositori Git.

## Lisensi

Privat. Hanya untuk penggunaan internal.
