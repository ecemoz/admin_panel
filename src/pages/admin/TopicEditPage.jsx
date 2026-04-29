import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { getTopics, updateTopic } from '../../api/topicsApi'
import { Panel } from '../../components/ui/Panel'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, LoadingState } from '../../components/ui/TableStates'
import { TopicForm } from '../../features/topics/TopicForm'
import { getErrorMessage } from '../../lib/errors'
import { unwrapList } from '../../lib/response'

export function TopicEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({ queryKey: ['topics'], queryFn: getTopics })

  const mutation = useMutation({
    mutationFn: updateTopic,
    onSuccess: () => {
      toast.success('Topic guncellendi.')
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      navigate('/admin/topics')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const topic = unwrapList(data).find((item) => String(item.id) === String(id))

  return (
    <div>
      <PageHeader title="Topic Duzenle" description="Topic bilgilerini guncelleyin." />
      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState message="Topic detaylari alinamadi." /> : null}
      {!isLoading && !isError && topic ? (
        <Panel title="Topic Bilgileri">
          <TopicForm
            defaultValues={topic}
            onSubmit={(values) => mutation.mutate({ id, payload: values })}
            loading={mutation.isPending}
            submitLabel="Guncelle"
          />
        </Panel>
      ) : null}
    </div>
  )
}
