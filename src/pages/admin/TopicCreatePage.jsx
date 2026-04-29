import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { createTopic } from '../../api/topicsApi'
import { Panel } from '../../components/ui/Panel'
import { PageHeader } from '../../components/ui/PageHeader'
import { TopicForm } from '../../features/topics/TopicForm'

export function TopicCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createTopic,
    onSuccess: () => {
      toast.success('Topic olusturuldu.')
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      navigate('/admin/topics')
    },
    onError: () => toast.error('Topic olusturulamadi.'),
  })

  return (
    <div>
      <PageHeader title="Topic Olustur" description="Yeni topic ekleyin." />
      <Panel title="Topic Bilgileri">
        <TopicForm onSubmit={(values) => mutation.mutate(values)} loading={mutation.isPending} submitLabel="Olustur" />
      </Panel>
    </div>
  )
}
