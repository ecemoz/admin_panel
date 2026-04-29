import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Gecerli email girin.'),
  password: z.string().min(6, 'Sifre en az 6 karakter olmali.'),
})

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isAdmin } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  async function onSubmit(values) {
    try {
      await login(values)
      toast.success('Giris basarili.')
      const next = location.state?.from?.pathname || '/admin/dashboard'
      navigate(next, { replace: true })
    } catch (error) {
      toast.error(error?.message || 'Giris yapilamadi.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-panel lg:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white lg:block">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-100">Flutter Content Hub</p>
          <h1 className="mt-4 font-heading text-4xl font-bold">Admin Control Room</h1>
          <p className="mt-3 text-sm text-emerald-50/95">
            Mobil uygulamadaki tum ders, quiz ve kazanim iceriklerini merkezi olarak yonetin.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Admin Login</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold text-slate-900">Tekrar hos geldiniz</h2>
          <p className="mt-2 text-sm text-slate-600">Sadece admin rolu olan kullanicilar panele erisebilir.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input label="Email" type="email" placeholder="admin@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="Sifre" type="password" placeholder="******" error={errors.password?.message} {...register('password')} />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Giris yapiliyor...' : 'Giris Yap'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
