import { getLabels } from '@/actions/label';
import LabelDisplay from '@/components/dashboard/LabelDisplay';

const DashboardTagsPage = async () => {
  const response = await getLabels();
  
  return (
    <section className="w-full min-h-screen flex flex-col space-y-4 p-4">
      <h1 className="text-2xl font-bold">標籤管理</h1>
      <LabelDisplay labels={response.data} />
    </section>
  );
};

export default DashboardTagsPage;
