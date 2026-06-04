'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import PackageFormPage from '../../PackageFormPage';
import { Skeleton } from '@/components/ui/Spinner';

export default function EditPackagePage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-package', id],
    queryFn: () => adminApi.packages(),
    staleTime: 0,
    select: (res) => res.data?.data?.find((p: any) => String(p.id) === id),
  });

  if (isLoading) return (
    <div className="max-w-4xl mx-auto space-y-6">
      {[1,2,3].map(i => <Skeleton key={i} className="h-48" />)}
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center py-32 gap-4">
      <p className="text-5xl">❌</p>
      <p className="text-lg font-bold text-white">Paket tidak ditemukan</p>
    </div>
  );

  return <PackageFormPage pkg={data} />;
}
