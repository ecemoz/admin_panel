import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const schema = z.object({
  code: z.string().min(1, 'Kod en az 1 karakter olmali.').max(100, 'Kod en fazla 100 karakter olmali.'),
  title: z.string().min(1, 'Baslik en az 1 karakter olmali.').max(150, 'Baslik en fazla 150 karakter olmali.'),
  description: z.string().min(1, 'Aciklama en az 1 karakter olmali.').max(500, 'Aciklama en fazla 500 karakter olmali.'),
  topicId: z.string().nullable().optional().or(z.literal('')),
})

export function AchievementForm({ defaultValues, onSubmit, loading = false, submitLabel = 'Kaydet', topics = [] }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      code: defaultValues?.code || '',
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      topicId: defaultValues?.topicId || '',
    },
  })

  return (
    <form
      className="grid gap-3"
      onSubmit={handleSubmit((values) => {
        // Prepare values before submitting
        const payload = {
          ...values,
          topicId: values.topicId === '' ? null : values.topicId,
        }
        onSubmit(payload)
        if (!defaultValues) {
          reset({ code: '', title: '', description: '', topicId: '' })
        }
      })}
    >
      <Input label="Kod" error={errors.code?.message} {...register('code')} />
      <Input label="Baslik" error={errors.title?.message} {...register('title')} />
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Topic (Opsiyonel)</span>
        <select
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          {...register('topicId')}
        >
          <option value="">Global (Topic'e bagli degil)</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
        {errors.topicId?.message ? <p className="text-sm text-rose-600">{errors.topicId.message}</p> : null}
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Aciklama</span>
        <textarea
          rows={3}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          {...register('description')}
        />
        {errors.description?.message ? <p className="text-sm text-rose-600">{errors.description.message}</p> : null}
      </label>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
