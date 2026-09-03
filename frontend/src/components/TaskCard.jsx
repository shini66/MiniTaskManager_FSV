import { useState } from 'react'

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const [loadingToggle, setLoadingToggle] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)

  const handleToggle = async () => {
    setLoadingToggle(true)
    await onToggle(task.id)
    setLoadingToggle(false)
  }

  const handleDelete = async () => {
    setLoadingDelete(true)
    await onDelete(task.id)
    setLoadingDelete(false)
  }

  return (
    <article className="bg-white/90 rounded-2xl shadow-[0_6px_20px_rgba(244,114,182,0.10)] border border-pink-100 p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={handleToggle}
            disabled={loadingToggle}
            aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
              task.completed
                ? 'bg-rose-500 border-rose-500'
                : 'border-pink-200 hover:border-rose-400'
            }`}
          />
          <div className="min-w-0">
            <p
              className={`font-medium text-gray-800 break-words ${
                task.completed ? 'line-through text-gray-400' : ''
              }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-gray-500 break-words mt-0.5">{task.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="text-xs text-rose-600 hover:text-rose-800 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={loadingDelete}
            className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {loadingDelete ? '...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </article>
  )
}
