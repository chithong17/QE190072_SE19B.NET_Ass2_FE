import { redirect } from 'next/navigation';

export default function TagsManageRedirect() {
  redirect('/admin/tags');
}
