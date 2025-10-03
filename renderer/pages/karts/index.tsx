import Layout from "@/components/shared/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { Container } from "@mantine/core";

const KartsPage = () => {
  return (
    <Layout currentRoute="/karts">
      <Container my="sm">
        <PageHeader title="Karts" />
      </Container>
    </Layout>
  );
};
export default KartsPage;
