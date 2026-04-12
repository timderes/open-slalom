import Layout from "@/components/shared/Layout";
import PageHeader from "@/components/shared/PageHeader";
import database from "@/lib/database";
import clearDatabase from "@/lib/database/utils/clearDatabase";
import {
  Button,
  Code,
  Container,
  Divider,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconDatabaseExport,
  IconDatabaseImport,
  IconDatabaseMinus,
} from "@tabler/icons-react";
import { exportDB, importInto } from "dexie-export-import";

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

  const handleDatabaseExport = () => {
    exportDB(database, {}).then((blob) => {
      const fileName = `msf-training-db-backup-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.json`;

      blob.arrayBuffer().then((bufferData) => {
        if (typeof window !== "undefined") {
          window.ipc.send("save-file", { fileName, bufferData });
        } else {
          console.error("IPC not available. Export failed.");
        }
      });
    });
    return;
  };

  const handleDatabaseImport = () => {
    modals.openConfirmModal({
      title: "Datenbank importieren?",
      children: (
        <Text>
          Beim Importieren wird die bestehende Datenbank gelöscht und durch die
          importierte Version ersetzt. Möchten Sie fortfahren?
        </Text>
      ),
      labels: { confirm: "Importieren", cancel: "Abbrechen" },
      onConfirm: () => {
        if (typeof window === "undefined") {
          console.error("IPC not available. Import failed.");
          return;
        }

        window.ipc.once("open-file", async (bufferData) => {
          if (!bufferData) {
            return;
          }

          try {
            const blob = new Blob([new Uint8Array(bufferData as number[])], {
              type: "application/json",
            });

            await importInto(database, blob, { clearTablesBeforeImport: true });
            console.log("Imported database successfully!");
          } catch (err) {
            console.error("Failed to import database:", err);
          }
        });

        window.ipc.send("open-file", {
          title: "Datenbank importieren",
          filters: [{ name: "JSON", extensions: ["json"] }],
          buttonLabel: "Importieren",
        } as Electron.OpenDialogOptions);
      },
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
          <Group>
            <Button
              leftSection={<IconDatabaseImport />}
              onClick={() => handleDatabaseImport()}
            >
              Datenbank importieren
            </Button>
            <Button
              leftSection={<IconDatabaseExport />}
              onClick={() => handleDatabaseExport()}
            >
              Exportieren
            </Button>

            <Button
              leftSection={<IconDatabaseMinus />}
              color="red"
              onClick={() => handleDeleteDatabase()}
            >
              Löschen
            </Button>
          </Group>
        </Stack>
      </Container>
    </Layout>
  );
};
export default SettingsPage;
