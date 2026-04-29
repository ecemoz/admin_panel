import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { getLessons, updateLesson } from '../../api/lessonsApi'
import { getTopics } from '../../api/topicsApi'
import { Panel } from '../../components/ui/Panel'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, LoadingState } from '../../components/ui/TableStates'
import { LessonForm } from '../../features/lessons/LessonForm'
import { unwrapList } from '../../lib/response'

export function LessonEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const lessonsQuery = useQuery({ queryKey: ['lessons'], queryFn: getLessons })
  const topicsQuery = useQuery({ queryKey: ['topics'], queryFn: getTopics })

  const mutation = useMutation({
    mutationFn: updateLesson,
    onSuccess: () => {
      toast.success('Lesson guncellendi.')
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      navigate('/admin/lessons')
    },
    onError: () => toast.error('Lesson guncellenemedi.'),
  })

  const lesson = unwrapList(lessonsQuery.data).find((item) => String(item.id) === String(id))
  const topics = unwrapList(topicsQuery.data)

  return (
    <div>
      <PageHeader title="Lesson Duzenle" description="Ders bilgilerini guncelleyin." />
      {lessonsQuery.isLoading || topicsQuery.isLoading ? <LoadingState /> : null}
      {lessonsQuery.isError || topicsQuery.isError ? <ErrorState message="Gerekli veriler alinamadi." /> : null}

      {!lessonsQuery.isLoading && !topicsQuery.isLoading && !lessonsQuery.isError && !topicsQuery.isError && lesson ? (
        <Panel title="Lesson Bilgileri">
          <LessonForm
            topics={topics}
            defaultValues={lesson}
            onSubmit={(values) => mutation.mutate({ id, payload: values })}
            loading={mutation.isPending}
            submitLabel="Guncelle"
          />
        </Panel>
      ) : null}
    </div>
  )
}
