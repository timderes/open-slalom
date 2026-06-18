import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';

const ChampionshipsPage = () => {
  return (
    <Layout currentRoute="/championships">
      <PageContent>
        <PageHeader title="Meisterschaften" />
      </PageContent>
    </Layout>
  );
};

export default ChampionshipsPage;
