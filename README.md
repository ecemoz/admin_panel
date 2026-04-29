# Admin Panel

React + Vite tabanli, JWT auth ile korunan admin panel.

## Teknoloji

- React + JavaScript + Vite
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod

## Kurulum

1. `.env.example` dosyasini `.env` olarak kopyalayin.
2. API bilgilerini guncelleyin:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_AUTH_LOGIN_ENDPOINT=/api/auth/login
```

3. Bagimliliklari yukleyin ve calistirin:

```bash
npm install
npm run dev
```

## Sayfalar

- `/admin/login`
- `/admin/dashboard`
- `/admin/topics`
- `/admin/topics/create`
- `/admin/topics/:id/edit`
- `/admin/lessons`
- `/admin/lessons/create`
- `/admin/lessons/:id/edit`
- `/admin/quizzes`
- `/admin/quizzes/:id/edit`
- `/admin/achievements`
- `/admin/users`

## Mimari Notlar

- Axios client: `src/api/http.js`
- Token localStorage'da tutulur ve interceptor ile otomatik `Authorization: Bearer <token>` eklenir.
- `401` durumunda otomatik logout + `/admin/login` yonlendirmesi yapilir.
- `ProtectedRoute` ile sadece admin roluna erisim verilir.
- CRUD islemlerinden sonra TanStack Query cache invalidation uygulanir.
- Silme islemlerinde confirm modal kullanilir.
- Basari/hata durumlari toast ile gosterilir.
