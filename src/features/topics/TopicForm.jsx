import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const topicSchema = z.object({
  title: z.string().min(2, 'Baslik en az 2 karakter olmali.'),
  description: z.string().min(5, 'Aciklama en az 5 karakter olmali.'),
  imageUrl: z.string().url('Gecerli bir URL girin.').optional().or(z.literal('')),
  order: z.coerce.number().int().nonnegative('Sira 0 veya daha buyuk olmali.'),
})

export function TopicForm({ defaultValues, onSubmit, loading = false, submitLabel = 'Kaydet' }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      imageUrl: defaultValues?.imageUrl || '',
      order: defaultValues?.order ?? 0,
    },
  })

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Baslik" error={errors.title?.message} {...register('title')} />
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Aciklama</span>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          {...register('description')}
        />
        {errors.description?.message ? <p className="text-sm text-rose-600">{errors.description.message}</p> : null}
      </label>
      <Input label="Gorsel URL" error={errors.imageUrl?.message} {...register('imageUrl')} />
      <Input label="Sira" type="number" error={errors.order?.message} {...register('order')} />
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
