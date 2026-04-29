import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const lessonSchema = z.object({
  title: z.string().min(1, 'Baslik en az 1 karakter olmali.').max(150, 'Baslik en fazla 150 karakter olmali.'),
  content: z.string().min(1, 'Icerik en az 1 karakter olmali.'),
  topicId: z.string().min(1, 'Topic secmelisiniz.'),
  order: z.coerce.number().int(),
  isLocked: z.boolean().default(false),
})

export function LessonForm({ topics, defaultValues, onSubmit, loading = false, submitLabel = 'Kaydet' }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      content: defaultValues?.content || '',
      topicId: defaultValues?.topicId ?? '',
      order: defaultValues?.order ?? 0,
      isLocked: defaultValues?.isLocked ?? false,
    },
  })

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Baslik" error={errors.title?.message} {...register('title')} />
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Topic</span>
        <select
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          {...register('topicId')}
        >
          <option value="">Topic secin</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
        {errors.topicId?.message ? <p className="text-sm text-rose-600">{errors.topicId.message}</p> : null}
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Icerik</span>
        <textarea
          rows={6}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          {...register('content')}
        />
        {errors.content?.message ? <p className="text-sm text-rose-600">{errors.content.message}</p> : null}
      </label>
      <div className="flex gap-4">
        <div className="flex-1">
          <Input label="Sira" type="number" error={errors.order?.message} {...register('order')} />
        </div>
        <div className="flex-1">
          <label className="flex h-full items-center gap-2 pt-6">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" {...register('isLocked')} />
            <span className="text-sm font-medium text-slate-700">Kilitli Mi?</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
