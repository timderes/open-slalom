import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import { Text } from '@mantine/core';

const StatisticsPage = () => {
  return (
    <Layout currentRoute="/statistics">
      <PageContent fluid>
        <PageHeader title="Statistiken" />
        <Text>
          Die Statistik-Seite wird aktuell überarbeitet und wird in der nächsten Version wieder
          verfügbar sein.
        </Text>
      </PageContent>
    </Layout>
  );
};

export default StatisticsPage;
