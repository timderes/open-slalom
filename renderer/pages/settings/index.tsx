import Layout from '@/components/shared/Layout';
import PageHeader from '@/components/shared/PageHeader';
import { Alert, Button, ButtonGroup, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconDatabaseExport, IconDatabaseImport, IconDatabaseMinus } from '@tabler/icons-react';
import PageContent from '@/components/shared/PageContent';
import SettingsLayout from '@/components/shared/SettingsLayout';
import dbService from '@/lib/database/utils/service';

const SettingsPage = () => {
  const databaseVersion = dbService.getVersion() ?? 'Unbekannte Version';

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
          await dbService.clear();

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
      await dbService.exportToFile();

      notifications.show({
        title: 'Export gestartet',
        message: 'Bitte Speicherort auswählen.',
        color: 'green',
      });
    } catch (err) {
      console.error(err);

      notifications.show({
        title: 'Export fehlgeschlagen',
        message: 'Die Datenbank konnte nicht exportiert werden.',
        color: 'red',
      });
    }
  };

  const handleDatabaseImport = async () => {
    modals.openConfirmModal({
      title: 'Datenbank importieren?',
      children: <Text>Bestehende Daten werden überschrieben. Möchten Sie fortfahren?</Text>,
      labels: { confirm: 'Importieren', cancel: 'Abbrechen' },
      onConfirm: async () => {
        try {
          await dbService.importFromFile();

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
      },
    });
  };

  return (
    <Layout currentRoute="/settings">
      <SettingsLayout currentRoute="/settings">
        <PageContent>
          <PageHeader title="Datenbank" />
          <Text>
            Die Datenbank enthält lokale Daten zu Fahrern, Trainings und Karts. Das Löschen kann
            nicht rückgängig gemacht werden.
          </Text>
          <Alert title="Achtung!" color="red">
            Importieren Sie nur Backups aus kompatiblen Versionen, um Datenverlust zu vermeiden.
          </Alert>
          <Text mt="md">
            Datenbankversion:{' '}
            <Text component="span" ff="monospace">
              {databaseVersion}
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
