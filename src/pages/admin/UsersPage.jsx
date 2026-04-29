import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { deleteUser, getUsers, updateUserRole } from '../../api/usersApi'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { Button } from '../../components/ui/Button'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/TableStates'
import { PageHeader } from '../../components/ui/PageHeader'
import { getErrorMessage } from '../../lib/errors'
import { unwrapList } from '../../lib/response'

export function UsersPage() {
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  const roleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      toast.success('Kullanici rolu guncellendi.')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('Kullanici silindi.')
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const users = unwrapList(data)

  return (
    <div>
      <PageHeader title="Users" description="Kullanici kayitlari ve rollerini yonetin." />

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState message="Kullanici listesi alinamadi." /> : null}
      {!isLoading && !isError && users.length === 0 ? <EmptyState title="Kullanici bulunmadi." /> : null}

      {!isLoading && !isError && users.length > 0 ? (
        <div className="panel-surface overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold text-right">Islem</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-600">{user.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-lg border border-slate-300 px-2 py-1"
                      value={user.role || 'USER'}
                      onChange={(event) =>
                        roleMutation.mutate({ id: user.id, payload: { role: event.target.value } })
                      }
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="danger" onClick={() => setDeleteId(user.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Sil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Kullanici silinsin mi?"
        message="Bu islem geri alinamaz."
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
