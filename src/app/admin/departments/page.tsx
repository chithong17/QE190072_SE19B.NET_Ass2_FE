import { redirect } from 'next/navigation';

export default function LegacyAdminDepartmentsPage() {
  redirect('/manage/departments');
}
