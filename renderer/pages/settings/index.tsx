import Layout from '@/components/shared/Layout';
import PageHeader from '@/components/shared/PageHeader';
import clearDatabase from '@/lib/database/utils/clear';
import { useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconDatabaseExport, IconDatabaseImport, IconDatabaseMinus } from '@tabler/icons-react';
import PageContent from '@/components/shared/PageContent';
import SettingsLayout from '@/components/shared/SettingsLayout';
import { APP_NAME } from '@/lib/constants';
import database from '@/lib/database';

const SettingsPage = () => {
  const [databaseVersion, setDatabaseVersion] = useState<number>(undefined);

  useEffect(() => {
    setDatabaseVersion(database.verno ?? undefined);
  }, []);

  const handleDeleteDatabase = () => {
    modals.openConfirmModal({
      title: 'Datenbank wirklich löschen?',
      children: (
        <Text>Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten werden gelöscht!</Text>
      ),
      labels: { confirm: 'Löschen', cancel: 'Abbrechen' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await clearDatabase();

          notifications.show({
            title: 'Datenbank gelöscht',
            message: 'Alle gespeicherten Daten wurden entfernt.',
            color: 'green',
          });
        } catch (err) {
          console.error(err);

          notifications.show({
            title: 'Fehler',
            message: 'Datenbank konnte nicht gelöscht werden.',
            color: 'red',
          });
        }
      },
    });
  };

  const handleDatabaseExport = async () => {
    try {
      const { exportDB } = await import('dexie-export-import');

      const blob = await exportDB(database);

      const fileName = `${APP_NAME}-backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;

      const bufferData = await blob.arrayBuffer();

      if (typeof window !== 'undefined' && (window as any).ipc?.send) {
        window.ipc.send('save-file', { fileName, bufferData });

        notifications.show({
          title: 'Export gestartet',
          message: 'Bitte Speicherort auswählen.',
          color: 'green',
        });
      } else {
        throw new Error('IPC not available');
      }
    } catch (err) {
      console.error(err);

      notifications.show({
        title: 'Export fehlgeschlagen',
        message: 'Die Datenbank konnte nicht exportiert werden.',
        color: 'red',
      });
    }
  };

  const handleDatabaseImport = () => {
    modals.openConfirmModal({
      title: 'Datenbank importieren?',
      children: <Text>Bestehende Daten werden überschrieben. Möchten Sie fortfahren?</Text>,
      labels: { confirm: 'Importieren', cancel: 'Abbrechen' },
      onConfirm: () => {
        if (typeof window === 'undefined') return;

        window.ipc.once('open-file', async (bufferData) => {
          if (!bufferData) {
            notifications.show({
              title: 'Import abgebrochen',
              message: 'Keine Datei ausgewählt.',
              color: 'yellow',
            });
            return;
          }

          try {
            const blob = new Blob([new Uint8Array(bufferData as number[])], {
              type: 'application/json',
            });

            const { importInto } = await import('dexie-export-import');

            // Try safe import first
            try {
              await importInto(database, blob, {
                clearTablesBeforeImport: true,
              });
            } catch (err) {
              console.warn('Retry import without clearing tables', err);

              await importInto(database, blob, {
                clearTablesBeforeImport: false,
              });
            }

            notifications.show({
              title: 'Import erfolgreich',
              message: 'Datenbank wurde wiederhergestellt.',
              color: 'green',
            });
          } catch (err) {
            console.error(err);

            notifications.show({
              title: 'Import fehlgeschlagen',
              message: 'Ungültige oder beschädigte Datei.',
              color: 'red',
            });
          }
        });

        window.ipc.send('open-file', {
          title: 'Datenbank importieren',
          filters: [{ name: 'JSON', extensions: ['json'] }],
        });
      },
    });
  };

  return (
    <Layout currentRoute="/settings">
      <SettingsLayout currentRoute="/settings">
        <PageContent>
          <PageHeader title="Datenbank" />
          <Text>
            Die Datenbank enthält lokale Daten zu Fahrern, Trainings und Karts. Das Löschen ist kann
            nicht rückgängig gemacht werden.
          </Text>
          <Alert title="Achtung!" color="red">
            Importieren Sie nur Backups aus kompatiblen Versionen, um Datenverlust zu vermeiden.
          </Alert>
          <Text mt="md">
            Datenbankversion:{' '}
            <Text component="span" ff="monospace">
              {databaseVersion ?? 'Unbekannte Version'}
            </Text>
          </Text>
          <ButtonGroup mt="md">
            <Button leftSection={<IconDatabaseImport />} onClick={handleDatabaseImport}>
              Importieren
            </Button>
            <Button leftSection={<IconDatabaseExport />} onClick={handleDatabaseExport}>
              Exportieren
            </Button>
            <Button color="red" leftSection={<IconDatabaseMinus />} onClick={handleDeleteDatabase}>
              Löschen
            </Button>
          </ButtonGroup>
        </PageContent>
      </SettingsLayout>
    </Layout>
  );
};

export default SettingsPage;
