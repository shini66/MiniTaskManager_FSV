import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import { createTask, deleteTask, getMyTasks, toggleTask, updateTask } from '../services/tasks';

export default function Dashboard() {

  const [tasks, setTasks] = useState([])

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [order, setOrder] = useState(1);

  const [totalTasks, setTotalTasks] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // null = cerrado | undefined = nueva tarea | task object = editar
  const [modalTask, setModalTask] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await getMyTasks({ search, status, page, limit, order })
      // Normalizar id (usa _id de Mongoose si no existe `id`)
      setTasks(data.tasks.map((t) => ({ ...t, id: t.id || t._id })))
      setTotalTasks(data.totalTasks || 0)
      setTotalPages(data.totalPages || 1)
    } catch {
      setError('No se pudieron cargar las tareas')
    } finally {
      setLoading(false)
    }
  }, [search, status, page, limit, order])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const openCreate = () => {
    setModalTask(undefined)
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setModalTask(task)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalTask(null)
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
    setPage(1)
  }

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value))
    setPage(1)
  }

  const handleSave = async (form) => {
    if (modalTask) {
      const { data } = await updateTask(modalTask.id, form)
      const normalized = { ...data, id: data.id || data._id }
      setTasks((prev) => prev.map((t) => (t.id === normalized.id ? normalized : t)))
    } else {
      const { data } = await createTask(form)
      const normalized = { ...data, id: data.id || data._id }
      setTasks((prev) => [normalized, ...prev])
    }
  }

  const handleToggle = async (id) => {
    const { data } = await toggleTask(id)
    const normalized = { ...data, id: data.id || data._id }
    setTasks((prev) => prev.map((t) => (t.id === normalized.id ? normalized : t)))
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const handleOrder = async () => {
    setOrder((prev) => (prev === 1 ? -1 : 1))
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-100">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={search}
            onChange={handleSearchChange}
            className="flex-1 border border-pink-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white/80"/>
          <select
            value={status}
            onChange={handleStatusChange}
            className="border border-pink-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white/80">
            <option value="">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
          </select>
        </div>

        {/* Botón nueva tarea */}
        <button
          onClick={openCreate}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
        >
          + Nueva tarea
        </button>

        {/* Error general */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Loading */}
        {loading && (
          <p className="text-gray-400 text-sm text-center">Cargando tareas...</p>
        )}

        {/* Sin tareas */}
        {!loading && totalTasks === 0 && (
          <p className="text-gray-400 text-sm text-center mt-8">
            Todavía no tenés tareas. ¡Creá una!
          </p>
        )}

        

        <section>
          <div className="flex items-center justify-between gap-6 my-4">
            <div>
              <button
                  onClick={handleOrder}
                  className="px-3 py-2 bg-rose-100 text-rose-700 rounded disabled:opacity-50 transition-opacity"
                >
                  {order === 1 ? "⬆️" : "⬇️"}
                </button>
              <select
                value={limit}
                onChange={handleLimitChange}
                className="border border-pink-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white/80"
              >
                <option value={2}>2 por página</option>
                <option value={5}>5 por página</option>
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
              </select>
            </div>

            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total de tareas ({totalTasks})
            </h2>

            <div className="flex items-center gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 bg-rose-100 text-rose-700 rounded disabled:opacity-50 transition-opacity"
              >
                {"<"}
              </button>
              
              <span className="text-sm text-gray-600 font-medium">
                {page} / {totalPages}
              </span>
              
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1 bg-rose-100 text-rose-700 rounded disabled:opacity-50 transition-opacity"
              >
                {">"}
              </button>
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <li key={task.id}>
                <TaskCard
                  task={task}
                  onToggle={handleToggle}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              </li>
            ))}
          </ul>
        </section>

      </main>

      {modalOpen && (
        <TaskForm
          task={modalTask}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
