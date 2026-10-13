"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, ChevronLeft, FolderKanban, Loader2, Tag as TagIcon } from 'lucide-react';
import api from '@/lib/axios';
import { extractErrorMessage } from '@/lib/api-error';

interface Tag { tagId: number; tagName: string; color?: string | null }
interface ProjectSummary { projectId: number; projectName: string }
interface AccountSummary { accountId: number; fullName: string; email: string }
interface Task { taskId: number; title: string; description: string | null; status: number; priority: number; dueDate: string | null; projectId: number; project?: ProjectSummary; tags: Tag[]; createdDate?: string; updatedDate?: string | null; createdBy?: AccountSummary | null; updatedBy?: AccountSummary | null }

const statuses = ['To Do', 'In Progress', 'Done', 'Cancelled'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get(`/tasks/${params.id}`)
      .then((response) => active && setTask(response.data))
      .catch((requestError: unknown) => active && setError(extractErrorMessage(requestError, 'Unable to load this task.')))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [params.id]);

  if (loading) return <div className="grid min-h-80 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>;
  if (!task) return <div className="p-8 text-center text-slate-500">{error || 'Task not found.'}</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <Link href={`/projects/${task.projectId}`} className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600"><ChevronLeft className="h-4 w-4" />Back to project</Link>
      <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-3 flex gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{statuses[task.status] ?? 'Unknown'}</span><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{priorities[task.priority] ?? 'Unknown'} priority</span></div><h1 className="text-3xl font-bold text-slate-950">{task.title}</h1></div></div>
        <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-600">{task.description || 'No description was provided.'}</p>
        <dl className="mt-8 grid gap-4 border-t pt-6 sm:grid-cols-2">
          <div><dt className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400"><FolderKanban className="h-4 w-4" />Project</dt><dd className="mt-1 text-sm font-medium">{task.project?.projectName || `Project #${task.projectId}`}</dd></div>
          <div><dt className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400"><Calendar className="h-4 w-4" />Due date</dt><dd className="mt-1 text-sm font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</dd></div>
          <div className="sm:col-span-2"><dt className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400"><TagIcon className="h-4 w-4" />Tags</dt><dd className="mt-2 flex flex-wrap gap-2">{task.tags?.length ? task.tags.map((tag) => <span key={tag.tagId} className="rounded-full border px-2.5 py-1 text-xs" style={{ borderColor: tag.color || undefined }}>{tag.tagName}</span>) : <span className="text-sm text-slate-500">No tags</span>}</dd></div>
        </dl>
        {(task.createdBy || task.updatedBy) && <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-500"><p>Created by: {task.createdBy?.fullName || 'Unknown'}</p>{task.updatedBy && <p className="mt-1">Last updated by: {task.updatedBy.fullName}</p>}</div>}
      </article>
    </div>
  );
}
