import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { createLesson } from '../../api/lessonsApi'
import { getTopics } from '../../api/topicsApi'
import { Panel } from '../../components/ui/Panel'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, LoadingState } from '../../components/ui/TableStates'
import { LessonForm } from '../../features/lessons/LessonForm'
import { unwrapList } from '../../lib/response'

export function LessonCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({ queryKey: ['topics'], queryFn: getTopics })

  const mutation = useMutation({
    mutationFn: createLesson,
    onSuccess: () => {
      toast.success('Lesson olusturuldu.')
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      navigate('/admin/lessons')
    },
    onError: () => toast.error('Lesson olusturulamadi.'),
  })

  const topics = unwrapList(data)

  return (
    <div>
      <PageHeader title="Lesson Olustur" description="Yeni ders icerigi ekleyin." />
      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState message="Topic listesi alinamadi." /> : null}
      {!isLoading && !isError ? (
        <Panel title="Lesson Bilgileri">
          <LessonForm
            topics={topics}
            onSubmit={(values) => mutation.mutate(values)}
            loading={mutation.isPending}
            submitLabel="Olustur"
          />
        </Panel>
      ) : null}
    </div>
  )
}
