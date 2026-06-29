import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import Stat from '@/components/shared/Stat';
import database from '@/lib/database';
import { formatTime } from '@/lib/time/formatTime';
import {
  ActionIcon,
  Anchor,
  Button,
  Card,
  EmptyState,
  Group,
  Skeleton,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconCode, IconPencil, IconTrash, IconZoomQuestion } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { useRouter } from 'next/router';

const KartViewPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  const kart = useLiveQuery(() => database.karts.get(uuid?.toString() ?? ''), [uuid], undefined);
  const drivers = useLiveQuery(() => database.drivers.toArray(), [], undefined);

  if (kart === undefined || drivers === undefined) {
    return (
      <Layout currentRoute="/karts">
        <PageContent>
          <Skeleton height={32} radius="sm" />
          <Skeleton height={120} mt={8} radius="sm" />
        </PageContent>
      </Layout>
    );
  }

  if (!kart) {
    return (
      <Layout currentRoute="/karts">
        <EmptyState
          icon={<IconZoomQuestion />}
          title="Dieses Kart konnte nicht gefunden werden!"
          description={`Möglicherweise wurde es gelöscht oder die UUID ist ungültig. (UUID: ${uuid})`}
          size="lg"
          withIndicatorBackground
        >
          <EmptyState.Actions>
            <Button onClick={() => router.push('/karts')} variant="filled">
              Zurück zu den Karts
            </Button>
          </EmptyState.Actions>
        </EmptyState>
      </Layout>
    );
  }

  const history = kart.history as KartHistory;

  const totalTrainings = history?.trainingUuids.length;

  const driverEntries = Object.entries(history?.usageByDriver ?? {});

  const handleDeleteKartHistory = () => {
    modals.openConfirmModal({
      title: 'Trainingsdaten löschen?',
      children: (
        <Text>
          Sollen wirklich alle Trainingsdaten des Karts "{kart.name}" gelöscht werden? Dieser
          Vorgang kann nicht rückgängig gemacht werden.
        </Text>
      ),
      labels: {
        confirm: 'Löschen',
        cancel: 'Abbrechen',
      },
      centered: true,
      confirmProps: { color: 'red' },

      onConfirm: () => {
        database.karts
          .update(kart.uuid, {
            history: {
              totalLaps: 0,
              totalStints: 0,
              totalTime: 0,
              trainingUuids: [],
              usageByDriver: {},
              firstTraining: undefined,
              lastTraining: undefined,
            },
          })
          .then(() => {
            notifications.show({
              title: 'Trainingsdaten gelöscht',
              message: `Die Trainingsdaten des Karts "${kart.name}" wurden erfolgreich gelöscht.`,
              color: 'green',
            });
          })
          .catch((error) => {
            console.error('Error deleting kart history:', error);

            notifications.show({
              title: 'Fehler beim Löschen der Trainingsdaten',
              message: `Die Trainingsdaten des Karts "${kart.name}" konnten nicht gelöscht werden. Fehler: ${error}`,
              color: 'red',
            });
          });
      },
    });
  };

  return (
    <Layout currentRoute="/karts">
      <PageContent>
        <Group align="center">
          <PageHeader title={kart.name} />
          <Tooltip label="Trainingsdaten löschen" withArrow>
            <ActionIcon color="red" ms="auto" onClick={handleDeleteKartHistory}>
              <IconTrash />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Kart bearbeiten" withArrow>
            <ActionIcon onClick={() => router.push(`/karts/edit/${kart.uuid}`)}>
              <IconPencil />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={`UUID: ${kart.uuid}`} withArrow>
            <ActionIcon color="gray" variant="transparent">
              <IconCode />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Card withBorder mt="md">
          <Group grow>
            <Stat label="Chassis" value={kart.chassis} />
            <Stat label="Motor" value={kart.engine} />
            <Stat label="Typ" value={kart.type} />
          </Group>
        </Card>

        <Card withBorder mt="md">
          <Group grow>
            <Stat label="Gefahrene Runden" value={history?.totalLaps ?? 0} />
            <Stat label="Stints" value={history?.totalStints ?? 0} />
            <Stat label="Trainings" value={totalTrainings} />
            <Stat label="Fahrzeit" value={formatTime(history?.totalTime ?? 0, 'duration')} />
          </Group>
        </Card>

        <Card withBorder mt="md">
          <Group grow>
            <Stat
              label="Erstes Training"
              value={
                history?.firstTraining ? new Date(history.firstTraining).toLocaleDateString() : '-'
              }
            />
            <Stat
              label="Letztes Training"
              value={
                history?.lastTraining ? new Date(history.lastTraining).toLocaleDateString() : '-'
              }
            />
          </Group>
        </Card>

        <Card withBorder mt="md">
          <Group mb="sm">
            <strong>Fahrer-Statistik</strong>
          </Group>

          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Fahrer</Table.Th>
                <Table.Th>Stints</Table.Th>
                <Table.Th>Runden</Table.Th>
                <Table.Th>Zeit</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {driverEntries.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4} style={{ opacity: 0.5 }}>
                    Keine Daten vorhanden
                  </Table.Td>
                </Table.Tr>
              ) : (
                driverEntries.map(([driverUuid, stats]) => {
                  const driver = drivers.find((d) => d.uuid === driverUuid);

                  const driverName = driver
                    ? `${driver.firstName ?? ''} ${driver.lastName ?? ''}`.trim()
                    : 'Unbekannter Fahrer';
                  return (
                    <Table.Tr key={driverUuid}>
                      <Table.Td>
                        <Anchor component={Link} href={`/drivers/view/${driverUuid}`}>
                          {driverName}
                        </Anchor>
                      </Table.Td>
                      <Table.Td>{stats.stints}</Table.Td>
                      <Table.Td>{stats.laps}</Table.Td>
                      <Table.Td>{formatTime(stats.totalTime, 'duration')}</Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </Card>
      </PageContent>
    </Layout>
  );
};

export default KartViewPage;
