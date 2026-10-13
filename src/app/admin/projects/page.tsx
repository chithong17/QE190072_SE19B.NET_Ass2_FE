import { redirect } from 'next/navigation';

export default function LegacyAdminProjectsPage() {
  redirect('/manage/projects');
}
