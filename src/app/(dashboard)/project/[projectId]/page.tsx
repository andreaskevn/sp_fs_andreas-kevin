"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { fetchProjectById, type Project, type Task } from '@/controller/projectController';
import { updateTask } from '@/controller/taskController';
import NewTaskModal from '@/app/components/newTaskModal';
import EditTaskModal from '@/app/components/editTaskModal';
import { FiLoader, FiPlus, FiSettings, FiEdit2 } from 'react-icons/fi';

import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

const TaskCard = ({ task, onEdit }: { task: Task; onEdit: (task: Task) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { task } });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-gray-800 p-4 rounded-lg mb-3 shadow-md border border-gray-700 touch-none relative group cursor-grab active:cursor-grabbing">
      <div>
        <h4 className="font-bold text-white">{task.title}</h4>
        {task.description && <p className="text-sm text-gray-400 mt-1">{task.description}</p>}
        {task.assignee && <p className="text-xs text-purple-400 mt-3">Ditugaskan ke: {task.assignee.user.email}</p>}
      </div>
      <button
        onClick={() => onEdit(task)}
        className="absolute top-2 right-2 p-1 bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        <FiEdit2 size={14} />
      </button>
    </div>
  );
};

const KanbanColumn = ({ id, title, tasks, color, onEdit }: { id: TaskStatus; title: string; tasks: Task[]; color: string; onEdit: (task: Task) => void }) => {
  const { setNodeRef } = useSortable({ id });
  return (
    <div ref={setNodeRef} className="bg-gray-900/50 rounded-lg w-80 p-4 flex-shrink-0 h-full flex flex-col">
      <div className={`flex justify-between items-center mb-4 pb-2 border-b-2 ${color}`}><h3 className="font-bold text-lg text-white">{title}</h3><span className="text-sm bg-gray-700 text-white rounded-full px-2 py-1">{tasks.length}</span></div>
      <div className="flex-grow overflow-y-auto pr-2">
        <SortableContext items={tasks.map(t => t.id)}>
          {tasks.map(task => <TaskCard key={task.id} task={task} onEdit={onEdit} />)}
        </SortableContext>
      </div>
    </div>
  );
};


export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    const result = await fetchProjectById(projectId);
    if (result.success && result.data) {
      setProject(result.data);
      setTasks(result.data.tasks || []);
    } else { toast.error(result.error || "Tidak dapat memuat proyek."); }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => { setIsLoading(true); loadProject(); }, [loadProject]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const originalTasks = [...tasks]; // Simpan state awal jika API gagal

    setTasks(currentTasks => {
      const activeIndex = currentTasks.findIndex(t => t.id === active.id);
      const activeTask = currentTasks[activeIndex];

      // Tentukan status baru berdasarkan kolom tujuan (droppable container)
      // 'over.id' bisa jadi ID kolom atau ID task lain
      const overIsAColumn = ['TODO', 'IN_PROGRESS', 'DONE'].includes(over.id as string);
      const newStatus = overIsAColumn
        ? over.id as TaskStatus
        : currentTasks.find(t => t.id === over.id)!.status;

      let reorderedTasks;

      // Jika status berubah (pindah kolom)
      if (activeTask.status !== newStatus) {
        // 1. Update status task yang dipindah
        activeTask.status = newStatus;
        // 2. Pindahkan task ke array baru (tanpa mengubah urutan dulu)
        const movedTask = { ...activeTask, status: newStatus };
        const remainingTasks = currentTasks.filter(t => t.id !== active.id);
        reorderedTasks = [...remainingTasks, movedTask];
      } else { // Jika hanya bergeser di kolom yang sama
        const overIndex = currentTasks.findIndex(t => t.id === over.id);
        reorderedTasks = arrayMove(currentTasks, activeIndex, overIndex);
      }

      // 3. Hitung ulang 'order' untuk SEMUA kolom yang terdampak
      const finalTasks = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'].flatMap(status => {
        return reorderedTasks
          .filter(t => t.status === status)
          .sort((a, b) => a.order - b.order) // Pastikan urutan stabil sebelum re-index
          .map((task, index) => ({ ...task, order: index }));
      });

      return finalTasks;
    });

    // Panggil API di latar belakang setelah UI diperbarui
    const finalTaskState = tasks.find(t => t.id === active.id);
    if (finalTaskState) {
      toast.promise(
        updateTask(projectId, active.id as string, { status: finalTaskState.status, order: finalTaskState.order }),
        {
          loading: 'Menyimpan perubahan...',
          success: 'Board diperbarui!',
          error: (err) => {
            setTasks(originalTasks); // Jika gagal, kembalikan ke state semula
            return `Gagal menyimpan: ${err.toString()}`;
          },
        }
      );
    }
  };

  const columns = useMemo(() => {
    const columnData: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
    tasks.forEach(task => { columnData[task.status]?.push(task); });
    for (const status in columnData) { columnData[status as TaskStatus].sort((a, b) => a.order - b.order); }
    return columnData;
  }, [tasks]);

  const openEditModal = (task: Task) => setEditingTask(task);
  const closeEditModal = () => setEditingTask(null);

  if (isLoading) return <div className="flex justify-center items-center h-full w-full"><FiLoader className="text-purple-400 text-4xl animate-spin" /></div>;
  if (!project) return <p>Proyek tidak ditemukan.</p>;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div className="flex flex-col h-full w-full">
        {/* Header tidak berubah */}
        <header className="p-6 flex justify-between items-center shrink-0 border-b border-gray-800">
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsNewTaskModalOpen(true)} className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"><FiPlus className="mr-2" /> Task Baru</button>
            <Link href={`/projects/${projectId}/settings`} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"><FiSettings className="mr-2" /> Settings</Link>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-x-auto">
          <div className="flex space-x-6 h-full">
            {/* Kolom-kolom sekarang menggunakan data dari `columns` */}
            {(Object.keys(columns) as TaskStatus[]).map(status => (
              <KanbanColumn
                key={status}
                id={status}
                title={status.replace('_', ' ')}
                tasks={columns[status]}
                color={
                  status === 'TODO' ? 'border-purple-500' :
                    status === 'IN_PROGRESS' ? 'border-blue-500' : 'border-green-500'
                }
                onEdit={openEditModal}
              />
            ))}
          </div>
        </main>
        <NewTaskModal isOpen={isNewTaskModalOpen} onClose={() => setIsNewTaskModalOpen(false)} onTaskCreated={loadProject} projectId={projectId} members={project.members || []} />
        <EditTaskModal isOpen={!!editingTask} onClose={closeEditModal} onTaskUpdated={loadProject} task={editingTask} projectId={projectId} members={project.members || []} />
      </div>
    </DndContext>
  );
}