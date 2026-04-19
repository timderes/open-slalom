import Layout from "@/components/shared/Layout";
import PageHeader from "@/components/shared/PageHeader";
import clearDatabase from "@/lib/database/utils/clearDatabase";
import { useEffect, useState } from "react";
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
import { notifications } from "@mantine/notifications";
import {
  IconDatabaseExport,
  IconDatabaseImport,
  IconDatabaseMinus,
  IconRestore,
} from "@tabler/icons-react";
import { useLocalStorage } from "@mantine/hooks";
import { useRouter } from "next/router";
import type { TrainingState } from "@/lib/training/trainingReducer";

// This page uses some hacky stuff to dynamically import the database
// and dexie-export-import only on the client side, because both rely on
// browser APIs that are not available during server-side rendering.
//
// This allows us to keep the database logic separate from the UI and
// only load it when needed, without breaking SSR or causing hydration issues.
//
// DON'T LIKE HOW THE CODE LOOKS HERE, BUT IT WORKS...
const SettingsPage = () => {
  const [dbVerno, setDbVerno] = useState<number | null>(null);
  const router = useRouter();
  const [restorableTrainings] = useLocalStorage<TrainingState | undefined>({
    key: "training-backup",
    defaultValue: undefined,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const getDatabase = (await import("@/lib/database/getDatabase"))
          .default;
        const db = await getDatabase();
        if (mounted) setDbVerno((db as any).verno ?? null);
      } catch (err) {
        // ignore (no DB in non-electron/server environments)
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

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
      onConfirm: async () => {
        try {
          await clearDatabase();
          notifications.show({
            title: "Datenbank gelöscht",
            message: "Alle gespeicherten Daten wurden entfernt.",
            color: "green",
          });
        } catch (err) {
          console.error("Failed to clear database:", err);
          notifications.show({
            title: "Löschen fehlgeschlagen",
            message: "Die Datenbank konnte nicht gelöscht werden.",
            color: "red",
          });
        }
      },
    });
  };

  const handleDatabaseExport = async () => {
    try {
      const getDatabase = (await import("@/lib/database/getDatabase")).default;
      const db = await getDatabase();
      const { exportDB } = await import("dexie-export-import");
      const blob = await exportDB(db, {});
      const fileName = `msf-training-db-backup-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.json`;

      const bufferData = await blob.arrayBuffer();

      if (typeof window !== "undefined" && (window as any).ipc?.send) {
        window.ipc.send("save-file", { fileName, bufferData });
        notifications.show({
          title: "Export gestartet",
          message: "Bitte Speicherort und Dateiname auswählen.",
          color: "green",
        });
      } else {
        console.error("IPC not available. Export failed.");
        notifications.show({
          title: "Export fehlgeschlagen",
          message: "IPC ist nicht verfügbar.",
          color: "red",
        });
      }
    } catch (err) {
      console.error("Failed to export database:", err);
      notifications.show({
        title: "Export fehlgeschlagen",
        message: "Die Datenbank konnte nicht exportiert werden.",
        color: "red",
      });
    }
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
          notifications.show({
            title: "Import fehlgeschlagen",
            message: "IPC ist nicht verfügbar.",
            color: "red",
          });
          return;
        }

        window.ipc.once("open-file", async (bufferData) => {
          if (!bufferData) {
            notifications.show({
              title: "Import abgebrochen",
              message: "Es wurde keine Datei ausgewählt.",
              color: "yellow",
            });
            return;
          }

          try {
            const blob = new Blob([new Uint8Array(bufferData as number[])], {
              type: "application/json",
            });

            // import dexie-export-import dynamically (client-only)
            const { importInto } = await import("dexie-export-import");
            const getDatabase = (await import("@/lib/database/getDatabase"))
              .default;
            const db = await getDatabase();

            // First attempt: import and clear tables before import
            try {
              await importInto(db, blob, { clearTablesBeforeImport: true });
            } catch (err) {
              // If that fails, try importing without clearing tables (less destructive)
              console.warn(
                "Import with clearing failed, attempting without clearing:",
                err,
              );
              try {
                await importInto(db, blob, { clearTablesBeforeImport: false });
              } catch (err2) {
                console.error("Import failed in both modes:", err2);
                notifications.show({
                  title: "Import fehlgeschlagen",
                  message:
                    "Der Import ist fehlgeschlagen. Ist die Datei ein gültiger Datenbank-Export?",
                  color: "red",
                });
                return;
              }
            }

            console.log("Imported database successfully!");
            notifications.show({
              title: "Import erfolgreich",
              message: "Die Datenbank wurde erfolgreich importiert.",
              color: "green",
            });
          } catch (err) {
            console.error("Failed to import database:", err);
            notifications.show({
              title: "Import fehlgeschlagen",
              message: "Die Datei konnte nicht importiert werden.",
              color: "red",
            });
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

  const handleRestoreTraining = () => {
    modals.openConfirmModal({
      title: "Training wiederherstellen?",
      children: (
        <Text>
          Es wurde ein Backup des letzten Trainings gefunden. Möchten Sie dieses
          wiederherstellen?
        </Text>
      ),
      labels: { confirm: "Wiederherstellen", cancel: "Abbrechen" },
      color: "red",
      confirmProps: { color: "red" },
      onConfirm: () => {
        void router.push({
          pathname: "/training",
          query: { restoreBackup: "true" },
        });
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
          <Code>Datenbank Version: {dbVerno}</Code>
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
          <Divider label="Training" labelPosition="left" />
          <Text>
            Hier können Sie das letzte Training wiederherstellen, falls die App
            unerwartet geschlossen wurde oder abstürzt. Das Backup wird
            automatisch nach jedem abgeschlossenen Stint erstellt. Es enthält
            nur die Daten des letzten Trainings und wird mit jedem neuen
            Training überschrieben.
          </Text>
          <Button
            leftSection={<IconRestore />}
            disabled={!restorableTrainings}
            color="red"
            w="fit-content"
            onClick={() => handleRestoreTraining()}
          >
            Training wiederherstellen
          </Button>
        </Stack>
      </Container>
    </Layout>
  );
};
export default SettingsPage;
