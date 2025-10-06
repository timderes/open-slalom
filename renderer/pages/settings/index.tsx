import Layout from "@/components/shared/Layout";
import PageHeader from "@/components/shared/PageHeader";
import database from "@/lib/database";
import clearDatabase from "@/lib/database/utils/clearDatabase";
import {
  Button,
  ButtonGroup,
  Code,
  Container,
  Divider,
  Stack,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconDatabaseMinus, IconDatabaseShare } from "@tabler/icons-react";
import { exportDB } from "dexie-export-import";

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

  const handleDatabaseExport = async () => {
    exportDB(database, {}).then((blob) => {
      const fileName = `msf-training-db-backup-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.json`;

      blob.arrayBuffer().then((bufferData) => {
        window.ipc.send("save-file", { fileName, bufferData });
      });
    });
  };

  return (
    <Layout currentRoute="/settings">
      <Container my="sm">
        <Stack>
          <PageHeader title="Einstellungen" />
          <Divider label="Datenbank" labelPosition="left" />
          <Text>
            Die Datenbank umfasst gespeicherte Daten über die Fahrer, alle
            Trainings und die Karts. Das löschen der Datenbank kann nicht
            rückgängig gemacht werden!
          </Text>
          <Code>Datenbank Version: {database.verno}</Code>
          <ButtonGroup>
            <Button
              leftSection={<IconDatabaseShare />}
              onClick={() => handleDatabaseExport()}
            >
              Datenbank exportieren
            </Button>
            <Button
              leftSection={<IconDatabaseMinus />}
              color="red"
              onClick={() => handleDeleteDatabase()}
            >
              Datenbank löschen
            </Button>
          </ButtonGroup>
        </Stack>
      </Container>
    </Layout>
  );
};
export default SettingsPage;
