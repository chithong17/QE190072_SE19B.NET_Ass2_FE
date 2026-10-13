import { redirect } from 'next/navigation';

export default function DepartmentsManageRedirect() {
  redirect('/admin/departments');
}
