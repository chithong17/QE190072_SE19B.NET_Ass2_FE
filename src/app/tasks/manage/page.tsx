import { redirect } from 'next/navigation';

export default function TasksManageRedirect() {
  redirect('/manage/tasks');
}
