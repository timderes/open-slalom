import Layout from "@/components/shared/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { Container } from "@mantine/core";

const SettingsPage = () => {
  return (
    <Layout currentRoute="/settings">
      <Container my="sm">
        <PageHeader title="Einstellungen" />
      </Container>
    </Layout>
  );
};
export default SettingsPage;
