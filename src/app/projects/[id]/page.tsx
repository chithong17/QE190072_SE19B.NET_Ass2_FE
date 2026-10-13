"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, ChevronLeft, Loader2, Search } from 'lucide-react';
import api from '@/lib/axios';
import { extractErrorMessage } from '@/lib/api-error';

interface Tag { tagId: number; tagName: string; color?: string | null }
interface Task { taskId: number; title: string; description: string | null; status: number; priority: number; dueDate: string | null; tags: Tag[] }
interface Project { projectId: number; projectName: string; description: string | null; startDate: string; endDate: string | null; status: number }

const taskStatuses = ['To Do', 'In Progress', 'Done', 'Cancelled'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    let active = true;
    Promise.all([api.get(`/projects/${params.id}`), api.get(`/tasks/project/${params.id}`)])
      .then(([projectResponse, taskResponse]) => {
        if (!active) return;
        setProject(projectResponse.data);
        setTasks(taskResponse.data);
      })
      .catch((requestError: unknown) => active && setError(extractErrorMessage(requestError, 'Unable to load this project.')))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [params.id]);

  const visibleTasks = useMemo(() => tasks.filter((task) =>
    task.title.toLowerCase().includes(query.toLowerCase()) && (status === 'all' || task.status === Number(status))), [tasks, query, status]);
  const completed = tasks.filter((task) => task.status === 2).length;
  const progress = tasks.length ? Math.round(completed * 100 / tasks.length) : 0;

  if (loading) return <div className="grid min-h-80 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>;
  if (!project) return <div className="p-8 text-center text-slate-500">{error || 'Project not found.'}</div>;

  return (
    <div className="space-y-6 pb-8">
      <Link href="/projects" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600"><ChevronLeft className="h-4 w-4" />Back to projects</Link>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row">
          <div><h1 className="text-3xl font-bold text-slate-950">{project.projectName}</h1><p className="mt-2 max-w-3xl text-sm text-slate-600">{project.description || 'No description.'}</p><p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Calendar className="h-4 w-4" />{new Date(project.startDate).toLocaleDateString()} {project.endDate ? `— ${new Date(project.endDate).toLocaleDateString()}` : '— Ongoing'}</p></div>
          <div className="min-w-64 rounded-xl bg-slate-50 p-4"><div className="flex justify-between text-sm font-semibold"><span>Progress</span><span className="text-blue-600">{progress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-blue-600" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-xs text-slate-500">{completed} of {tasks.length} tasks completed</p></div>
        </div>
      </section>
      <div className="flex flex-col gap-3 rounded-2xl border bg-white p-3 md:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." className="h-10 w-full rounded-lg bg-slate-50 pl-9 pr-3 text-sm outline-none" /></div>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border px-3 text-sm"><option value="all">All statuses</option>{taskStatuses.map((label, index) => <option key={label} value={index}>{label}</option>)}</select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleTasks.map((task) => <Link key={task.taskId} href={`/tasks/${task.taskId}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex justify-between gap-3"><h2 className="font-semibold text-slate-900">{task.title}</h2><span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">{taskStatuses[task.status] ?? 'Unknown'}</span></div><p className="mt-2 line-clamp-2 text-sm text-slate-500">{task.description || 'No description.'}</p><div className="mt-4 flex justify-between text-xs text-slate-500"><span>{priorities[task.priority] ?? 'Unknown'} priority</span><span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span></div></Link>)}
      </div>
      {!visibleTasks.length && <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-slate-500">No matching tasks.</p>}
    </div>
  );
}
