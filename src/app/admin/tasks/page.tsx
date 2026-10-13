import { redirect } from 'next/navigation';

export default function LegacyAdminTasksPage() {
  redirect('/manage/tasks');
}
