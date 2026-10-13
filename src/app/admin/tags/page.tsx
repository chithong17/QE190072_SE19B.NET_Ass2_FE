import { redirect } from 'next/navigation';

export default function LegacyAdminTagsPage() {
  redirect('/manage/tags');
}
