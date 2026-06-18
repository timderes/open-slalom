import EmptyQueryResult from '@/components/shared/EmptyQueryResult';
import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import Stat from '@/components/shared/Stat';
import database from '@/lib/database';
import { formatTime } from '@/lib/time/formatTime';
import { ActionIcon, Card, Group, Skeleton, Tooltip, Table } from '@mantine/core';
import { IconCode } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/router';

const KartViewPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  const kart = useLiveQuery(() => database.karts.get(uuid?.toString() ?? ''), [uuid], undefined);

  if (kart === undefined) {
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
        <EmptyQueryResult title="Kart nicht gefunden">
          Kein Kart für UUID {uuid} gefunden.
        </EmptyQueryResult>
      </Layout>
    );
  }

  const history = kart.history as KartHistory;

  const totalTrainings = history?.trainingUuids.length;

  const driverEntries = Object.entries(history?.usageByDriver ?? {});

  return (
    <Layout currentRoute="/karts">
      <PageContent>
        {/* HEADER */}
        <Group align="center">
          <PageHeader title={kart.name} />
          <Tooltip label={`UUID: ${kart.uuid}`} withArrow>
            <ActionIcon variant="transparent" ms="auto">
              <IconCode />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* BASIC INFO */}
        <Card withBorder mt="md">
          <Group grow>
            <Stat label="Chassis" value={kart.chassis} />
            <Stat label="Motor" value={kart.engine} />
            <Stat label="Typ" value={kart.type} />
          </Group>
        </Card>

        {/* GLOBAL STATS */}
        <Card withBorder mt="md">
          <Group grow>
            <Stat label="Gefahrene Runden" value={history?.totalLaps ?? 0} />
            <Stat label="Stints" value={history?.totalStints ?? 0} />
            <Stat label="Trainings" value={totalTrainings} />
            <Stat label="Fahrzeit" value={formatTime(history?.totalTime ?? 0, 'duration')} />
          </Group>
        </Card>

        {/* TIME RANGE */}
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

        {/* DRIVER BREAKDOWN */}
        <Card withBorder mt="md">
          <Group mb="sm">
            <strong>Fahrer-Statistik</strong>
          </Group>

          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Fahrer UUID</Table.Th>
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
                driverEntries.map(([driverUuid, stats]) => (
                  <Table.Tr key={driverUuid}>
                    <Table.Td>{driverUuid}</Table.Td>
                    <Table.Td>{stats.stints}</Table.Td>
                    <Table.Td>{stats.laps}</Table.Td>
                    <Table.Td>{formatTime(stats.totalTime, 'duration')}</Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Card>
      </PageContent>
    </Layout>
  );
};

export default KartViewPage;
