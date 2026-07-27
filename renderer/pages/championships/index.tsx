import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import { Text } from '@mantine/core';

const ChampionshipsPage = () => {
  return (
    <Layout currentRoute="/championships">
      <PageContent>
        <PageHeader title="Meisterschaften" />
        <Text>Diese Funktion ist aktuell noch nicht verfügbar.</Text>
      </PageContent>
    </Layout>
  );
};

export default ChampionshipsPage;
