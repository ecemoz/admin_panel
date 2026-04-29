import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  createAchievement,
  deleteAchievement,
  getAchievements,
  updateAchievement,
} from '../../api/achievementsApi'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/TableStates'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'
import { getErrorMessage } from '../../lib/errors'
import { AchievementForm } from '../../features/achievements/AchievementForm'
import { unwrapList } from '../../lib/response'

export function AchievementPage() {
  const queryClient = useQueryClient()
  const [selectedDeleteId, setSelectedDeleteId] = useState(null)
  const [editingItem, setEditingItem] = useState(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['achievements'],
    queryFn: getAchievements,
  })

  const createMutation = useMutation({
    mutationFn: createAchievement,
    onSuccess: () => {
      toast.success('Achievement eklendi.')
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: updateAchievement,
    onSuccess: () => {
      toast.success('Achievement guncellendi.')
      setEditingItem(null)
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAchievement,
    onSuccess: () => {
      toast.success('Achievement silindi.')
      setSelectedDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const achievements = unwrapList(data)

  return (
    <div className="space-y-6">
      <PageHeader title="Achievements" description="Basarim tanimlari ve kosullarini yonetin." />

      <Panel title="Yeni Achievement">
        <AchievementForm onSubmit={(values) => createMutation.mutate(values)} loading={createMutation.isPending} submitLabel="Ekle" />
      </Panel>

      {editingItem ? (
        <Panel
          title="Achievement Duzenle"
          action={
            <Button variant="ghost" onClick={() => setEditingItem(null)}>
              Kapat
            </Button>
          }
        >
          <AchievementForm
            defaultValues={editingItem}
            onSubmit={(values) => updateMutation.mutate({ id: editingItem.id, payload: values })}
            loading={updateMutation.isPending}
            submitLabel="Guncelle"
          />
        </Panel>
      ) : null}

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState message="Achievement listesi alinamadi." /> : null}
      {!isLoading && !isError && achievements.length === 0 ? <EmptyState title="Henuz achievement yok." /> : null}

      {!isLoading && !isError && achievements.length > 0 ? (
        <div className="panel-surface overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Baslik</th>
                <th className="px-4 py-3 font-semibold">Kod</th>
                <th className="px-4 py-3 font-semibold text-right">Islem</th>
              </tr>
            </thead>
            <tbody>
              {achievements.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-600">{item.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{item.title}</td>
                  <td className="px-4 py-3 text-slate-600">{item.code}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => setEditingItem(item)}>
                        <Pencil className="mr-2 h-4 w-4" /> Duzenle
                      </Button>
                      <Button variant="danger" onClick={() => setSelectedDeleteId(item.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Sil
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ConfirmModal
        open={Boolean(selectedDeleteId)}
        title="Achievement silinsin mi?"
        message="Bu islem geri alinamaz."
        loading={deleteMutation.isPending}
        onCancel={() => setSelectedDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(selectedDeleteId)}
      />
    </div>
  )
}
