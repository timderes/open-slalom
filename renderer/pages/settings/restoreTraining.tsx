import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import SettingsLayout from '@/components/shared/SettingsLayout';
import { TrainingState } from '@/lib/training/trainingReducer';
import { Button, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconRestore } from '@tabler/icons-react';
import { useRouter } from 'next/router';

/**
 * Settings page for restoring the last training in case the app was closed
 * unexpectedly or crashes.
 *
 * The backup is automatically created after each completed stint and contains
 * only the data of the last training.
 *
 * It will be overwritten with each new training.
 */
const RestoreTrainingSettingsPage = () => {
  const router = useRouter();
  const [restorableTraining] = useLocalStorage<TrainingState | undefined>({
    key: 'training-backup',
    defaultValue: undefined,
  });

  const handleRestoreTraining = () => {
    modals.openConfirmModal({
      title: 'Training wiederherstellen?',
      children: (
        <Text>
          Es wurde ein Backup des letzten Trainings gefunden. Möchten Sie dieses wiederherstellen?
        </Text>
      ),
      labels: { confirm: 'Wiederherstellen', cancel: 'Abbrechen' },
      color: 'red',
      confirmProps: { color: 'red' },
      onConfirm: () => {
        void router.push({
          pathname: '/trainings/active',
          query: { restoreBackup: 'true' },
        });
      },
    });
  };

  return (
    <Layout currentRoute="/settings">
      <SettingsLayout currentRoute="/settings/restoreTraining">
        <PageContent>
          <PageHeader title="Training wiederherstellen" />
          <Text>
            Hier können Sie das letzte Training wiederherstellen, falls die App unerwartet
            geschlossen wurde oder abstürzt. Das Backup wird automatisch nach jedem abgeschlossenen
            Stint erstellt.
          </Text>
          <Text fw="bold">
            Es enthält nur die Daten des letzten Trainings und wird mit jedem neuen Training
            überschrieben.
          </Text>
          <Button
            leftSection={<IconRestore />}
            disabled={!restorableTraining}
            color="red"
            w="fit-content"
            onClick={() => handleRestoreTraining()}
          >
            Training wiederherstellen
          </Button>
        </PageContent>
      </SettingsLayout>
    </Layout>
  );
};

export default RestoreTrainingSettingsPage;
