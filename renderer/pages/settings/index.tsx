import Layout from "@/components/shared/Layout";
import PageHeader from "@/components/shared/PageHeader";
import clearDatabase from "@/lib/database/utils/clearDatabase";
import { Button, Container, Divider, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";

const SettingsPage = () => {
  const handleDeleteDatabase = () => {
    modals.openConfirmModal({
      title: "Datenbank wirklich löschen?",
      children: (
        <Text>
          Diese Aktion kann nicht rückgängig gemacht werden. Es werden alle
          Daten gelöscht!
        </Text>
      ),
      labels: { confirm: "Löschen", cancel: "Abbrechen" },
      confirmProps: { color: "red" },
      onConfirm: () => clearDatabase(),
    });
  };

  return (
    <Layout currentRoute="/settings">
      <Container my="sm">
        <Stack>
          <PageHeader title="Einstellungen" />
          <Divider label="Datenbank" labelPosition="left" />
          <Button color="red" onClick={() => handleDeleteDatabase()}>
            Datenbank löschen
          </Button>
        </Stack>
      </Container>
    </Layout>
  );
};
export default SettingsPage;
