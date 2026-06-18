import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';

const StatisticsPage = () => {
  return (
    <Layout currentRoute="/statistics">
      <PageContent>
        <PageHeader title="Statistiken" />
      </PageContent>
    </Layout>
  );
};

export default StatisticsPage;
