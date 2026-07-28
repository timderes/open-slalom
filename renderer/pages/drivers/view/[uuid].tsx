import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import Stat from '@/components/shared/Stat';
import { APP_LANGUAGE, DEFAULT_DATE_FORMAT } from '@/lib/constants';
import database from '@/lib/database';
import translateGender from '@/lib/misc/translateGender';
import { getDriverStats } from '@/lib/training/stats/driverStats';
import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Divider,
  EmptyState,
  Group,
  Skeleton,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconCode, IconPencil, IconSearch, IconZoomQuestion } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/router';
import { formatTime } from '@/lib/time/formatTime';
import { getJksClass, getSksClass } from '@/lib/misc/getDriverClass';

const DriverViewPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  const driverUuid = uuid?.toString();

  const driver = useLiveQuery(() => database.drivers.get(driverUuid), [driverUuid]);

  const sessionData = useLiveQuery(async () => {
    if (!driverUuid) {
      return undefined;
    }

    const participations = await database.participations
      .where('driverUuid')
      .equals(driverUuid)
      .toArray();

    const sessionUuids = participations.map((participation) => participation.sessionUuid);

    const sessions = (await database.sessions.where('uuid').anyOf(sessionUuids).toArray())?.sort(
      // Newest sessions first
      (a, b) => b.date - a.date,
    );

    const participationUuids = participations.map((participation) => participation.uuid);

    const stints = await database.stints
      .where('participationUuid')
      .anyOf(participationUuids)
      .toArray();

    const stintUuids = stints.map((stint) => stint.uuid);

    const laps = await database.laps.where('stintUuid').anyOf(stintUuids).toArray();

    return {
      sessions,
      participations,
      stints,
      laps,
    };
  }, [driverUuid]);

  if (driver === undefined) {
    return (
      <Layout currentRoute="/drivers">
        <PageContent>
          <Group>
            <Skeleton height={50} circle mb="xl" />
            <Skeleton height={20} width={100} radius="sm" />
          </Group>
          <Skeleton height={100} mt={8} radius="sm" />
        </PageContent>
      </Layout>
    );
  }

  if (driver === null) {
    return (
      <Layout currentRoute="/drivers">
        <EmptyState
          icon={<IconZoomQuestion />}
          title="Der Fahrer konnte nicht gefunden werden!"
          description={`Möglicherweise wurde er gelöscht oder die UUID ist ungültig. (UUID: ${uuid})`}
          size="lg"
          withIndicatorBackground
        >
          <EmptyState.Actions>
            <Button onClick={() => router.push('/drivers')} variant="filled">
              Zurück zu den Fahrern
            </Button>
          </EmptyState.Actions>
        </EmptyState>
      </Layout>
    );
  }

  const driverStats = getDriverStats({
    ...sessionData,
    driverUUID: driver.uuid,
  });

  return (
    <Layout currentRoute="/drivers">
      <PageContent>
        <Group align="center">
          <Avatar size="xl" color="initials" name={`${driver.firstName} ${driver.lastName}`} />
          <PageHeader title={driver.firstName + ' ' + driver.lastName} />
          <Tooltip
            label={`Das Profil von ${driver.firstName} bearbeiten`}
            withArrow
            position="bottom"
          >
            <ActionIcon
              ms="auto"
              w="fit-content"
              onClick={() => router.push(`/drivers/edit/${uuid}`)}
            >
              <IconPencil />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={`UUID: ${driver.uuid}`} withArrow position="bottom">
            <ActionIcon color="gray" variant="transparent" w="fit-content">
              <IconCode />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Card withBorder>
          <Group flex={{ xs: 'flex-row' }} grow>
            <Stat
              label="Geburtstag"
              value={new Date(driver.birthDate).toLocaleDateString(
                APP_LANGUAGE,
                DEFAULT_DATE_FORMAT,
              )}
            />
            <Stat label="Geschlecht" value={translateGender(driver.gender)} />
            <Stat label="JKS" value={getJksClass({ birthDate: driver.birthDate })} />
            <Stat label="SKS" value={getSksClass({ birthDate: driver.birthDate })} />
            <Stat label="Trainings" value={sessionData?.sessions.length} />
          </Group>
        </Card>
        <Divider label="Statistiken" labelPosition="left" />
        <Group flex={{ xs: 'flex-row' }} grow>
          <Stat label="Gefahrene Runden" value={driverStats?.totalLaps ?? 0} />
          <Stat
            label="Fahrzeit"
            value={formatTime(driverStats?.totalDrivingTime, 'duration') ?? '00:00'}
          />
          <Stat label="Pylonen" value={driverStats?.hitCones ?? 0} />
          <Stat label="Torfehler" value={driverStats?.hitGates ?? 0} />
        </Group>
        <Divider label="Trainings" labelPosition="left" />
        {sessionData?.sessions === undefined ? (
          <Skeleton height={300} mt={8} radius="sm" />
        ) : (
          sessionData?.sessions &&
          sessionData.sessions.length > 0 && (
            <Table mt="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Datum</Table.Th>
                  <Table.Th>Modus</Table.Th>
                  <Table.Th>{/* Actions */}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sessionData.sessions.map((session) => (
                  <Table.Tr key={session.uuid}>
                    <Table.Td>
                      {new Date(session.createdAt).toLocaleDateString(
                        APP_LANGUAGE,
                        DEFAULT_DATE_FORMAT,
                      )}
                    </Table.Td>
                    <Table.Td>{session.slalomType}</Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        onClick={() => router.push(`/trainings/${session.uuid}/view`)}
                      >
                        <IconSearch />
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )
        )}
        {sessionData?.sessions.length === 0 ? (
          <Text>{driver.firstName} hat noch an keinem Training teilgenommen.</Text>
        ) : null}
      </PageContent>
    </Layout>
  );
};

export default DriverViewPage;
