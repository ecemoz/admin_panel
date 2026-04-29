import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const schema = z.object({
  title: z.string().min(2, 'Baslik en az 2 karakter olmali.'),
  description: z.string().min(5, 'Aciklama en az 5 karakter olmali.'),
  iconUrl: z.string().url('Gecerli URL girin.').optional().or(z.literal('')),
  requiredScore: z.coerce.number().int().nonnegative('Skor negatif olamaz.'),
})

export function AchievementForm({ defaultValues, onSubmit, loading = false, submitLabel = 'Kaydet' }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      iconUrl: defaultValues?.iconUrl || '',
      requiredScore: defaultValues?.requiredScore ?? 0,
    },
  })

  return (
    <form
      className="grid gap-3"
      onSubmit={handleSubmit((values) => {
        onSubmit(values)
        if (!defaultValues) {
          reset({ title: '', description: '', iconUrl: '', requiredScore: 0 })
        }
      })}
    >
      <Input label="Baslik" error={errors.title?.message} {...register('title')} />
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Aciklama</span>
        <textarea
          rows={3}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          {...register('description')}
        />
        {errors.description?.message ? <p className="text-sm text-rose-600">{errors.description.message}</p> : null}
      </label>
      <Input label="Ikon URL" error={errors.iconUrl?.message} {...register('iconUrl')} />
      <Input label="Gerekli Skor" type="number" error={errors.requiredScore?.message} {...register('requiredScore')} />
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
