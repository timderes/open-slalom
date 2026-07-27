import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import { APP_LANGUAGE, DEFAULT_TIME_FORMAT } from '@/lib/constants';
import database from '@/lib/database';
import { getJksClass, getSksClass } from '@/lib/misc/getDriverClass';
import { formatTime } from '@/lib/time/formatTime';
import {
  getDiffToBest,
  getDiffToPrevious,
  getDriverFastestLap,
  getDriverRanking,
  getFastestLapTimestamp,
} from '@/lib/training/selectors';
import { Badge, Code, Divider, Skeleton, Stack, Table, Text, Title, Tooltip } from '@mantine/core';
import { IconFlagX } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/router';

const getTrainingClass = (mode: string, createdAt: number, birthDate: string | number) => {
  const trainingDate = new Date(createdAt);
  const birth = new Date(birthDate);

  if (Number.isNaN(trainingDate.getTime()) || Number.isNaN(birth.getTime())) {
    return 'N/A';
  }

  const ageOffset = createdAt - birth.getTime();
  const shiftedBirth = new Date(Date.now() - ageOffset);

  return mode === 'JKS'
    ? getJksClass({
        birthDate: shiftedBirth.toISOString(),
      })
    : getSksClass({
        birthDate: shiftedBirth.toISOString(),
      });
};

const TrainingViewPage = () => {
  const router = useRouter();
  const uuid = router.query.uuid?.toString();

  const training = useLiveQuery(async () => {
    if (!uuid) {
      return undefined;
    }

    const session = await database.sessions.get(uuid);

    if (!session) {
      return null;
    }

    const participations = await database.participations
      .where('sessionUuid')
      .equals(uuid)
      .toArray();

    const driverUuids = participations.map((participation) => participation.driverUuid);

    const drivers =
      driverUuids.length > 0
        ? await database.drivers.where('uuid').anyOf(driverUuids).toArray()
        : [];

    const stints =
      participations.length > 0
        ? await database.stints
            .where('participationUuid')
            .anyOf(participations.map((participation) => participation.uuid))
            .toArray()
        : [];

    const laps = await database.laps.where('sessionUuid').equals(uuid).toArray();

    const karts = await database.karts.toArray();

    const driversWithData = drivers.map((driver) => {
      const participation = participations.find((item) => item.driverUuid === driver.uuid);

      const driverStints = stints
        .filter((stint) => stint.participationUuid === participation?.uuid)
        .map((stint) => ({
          ...stint,
          laps: laps.filter((lap) => lap.stintUuid === stint.uuid),
        }));

      return {
        ...driver,
        participationUuid: participation?.uuid,
        kartUuid: participation?.kartUuid,
        stints: driverStints,
      };
    });

    return {
      ...session,
      mode: session.slalomType,
      drivers: driversWithData,
      karts,
    };
  }, [uuid]);

  if (!uuid) {
    return (
      <Layout currentRoute="/trainings">
        <PageContent>
          <Title>Training konnte nicht geladen werden!</Title>
        </PageContent>
      </Layout>
    );
  }

  if (training === undefined) {
    return (
      <Layout currentRoute="/trainings">
        <PageContent>
          <Skeleton height={400} />
        </PageContent>
      </Layout>
    );
  }

  if (training === null) {
    return (
      <Layout currentRoute="/trainings">
        <PageContent>
          <Title>Training nicht gefunden!</Title>

          <Text>
            UUID: <Code>{uuid}</Code>
          </Text>
        </PageContent>
      </Layout>
    );
  }

  const sortedDrivers = getDriverRanking(training.drivers).map((entry) => entry.driver);

  return (
    <Layout currentRoute="/trainings">
      <PageContent>
        <Title>
          {training.mode}-Training am{' '}
          {new Date(training.createdAt).toLocaleDateString(APP_LANGUAGE, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Title>

        <Stack>
          <Badge>{training.drivers.length} Fahrer</Badge>

          <Text c="dimmed">
            Gestartet:{' '}
            {new Date(training.createdAt).toLocaleTimeString(APP_LANGUAGE, DEFAULT_TIME_FORMAT)}
            {' – '}
            Beendet:{' '}
            {new Date(training.updatedAt).toLocaleTimeString(APP_LANGUAGE, DEFAULT_TIME_FORMAT)}
          </Text>
        </Stack>

        <Table mt="xl">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>#</Table.Th>
              <Table.Th>Klasse</Table.Th>
              <Table.Th />
              <Table.Th>Fahrer</Table.Th>
              <Table.Th>Kart</Table.Th>
              <Table.Th>Bestzeit</Table.Th>
              <Table.Th>Abstand</Table.Th>
              <Table.Th>Intervall</Table.Th>
              <Table.Th>Ø-Zeit</Table.Th>
              <Table.Th>Runden</Table.Th>
              <Table.Th>Zeitpunkt</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {sortedDrivers.map((driver, index) => {
              const fastestLap = getDriverFastestLap(driver);

              const diffToBest = getDiffToBest(driver, training.drivers);

              const diffToPrevious = getDiffToPrevious(driver, training.drivers);

              const fastestLapTimestamp = getFastestLapTimestamp(driver);

              const kartName =
                training.karts.find((kart) => kart.uuid === driver.kartUuid)?.name ?? 'N/A';

              const validLaps = driver.stints.flatMap((stint) =>
                stint.laps.filter((lap) => !lap.isInvalid),
              );

              const averageLap =
                validLaps.length > 0
                  ? validLaps.reduce((sum, lap) => sum + lap.timeWithPenalties, 0) /
                    validLaps.length
                  : undefined;

              const totalLaps = driver.stints.reduce((sum, stint) => sum + stint.laps.length, 0);

              return (
                <Table.Tr key={driver.uuid}>
                  <Table.Td>{index + 1}.</Table.Td>
                  <Table.Td>
                    K{getTrainingClass(training.mode, training.createdAt, driver.birthDate)}
                  </Table.Td>
                  <Table.Td>{driver.gender === 'female' ? 'D' : undefined}</Table.Td>
                  <Table.Td>
                    {driver.firstName} {driver.lastName}
                  </Table.Td>
                  <Table.Td>{kartName}</Table.Td>
                  <Table.Td>
                    <Text ff="monospace" fw="bold" c={index === 0 ? 'grape' : undefined}>
                      {fastestLap ? formatTime(fastestLap.timeWithPenalties, 'lap') : 'N/A'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {index === 0 ? (
                      <Text ff="monospace" fw="bold">
                        ---
                      </Text>
                    ) : (
                      <Text ff="monospace" fw="bold">
                        {diffToBest !== undefined ? formatTime(diffToBest, 'gap') : 'N/A'}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {diffToPrevious !== undefined ? formatTime(diffToPrevious, 'gap') : '---'}
                  </Table.Td>
                  <Table.Td>
                    {averageLap !== undefined ? formatTime(averageLap, 'lap') : 'N/A'}
                  </Table.Td>
                  <Table.Td>{totalLaps}</Table.Td>
                  <Table.Td>
                    {fastestLapTimestamp
                      ? new Date(fastestLapTimestamp).toLocaleTimeString(
                          APP_LANGUAGE,
                          DEFAULT_TIME_FORMAT,
                        )
                      : 'N/A'}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>

        {sortedDrivers.map((driver) => {
          const rows = driver.stints.flatMap((stint, stintIndex) => {
            const kartName =
              training.karts.find((kart) => kart.uuid === driver.kartUuid)?.name ?? 'N/A';

            const previousLaps = driver.stints
              .slice(0, stintIndex)
              .reduce((sum, previousStint) => sum + previousStint.laps.length, 0);

            return stint.laps.map((lap, lapIndex) => {
              const overallLap = previousLaps + lapIndex + 1;

              const penaltyMs = Math.max(0, lap.timeWithPenalties - lap.time);

              return (
                <Table.Tr key={`${driver.uuid}-${lap.uuid}`} opacity={lap.isInvalid ? 0.2 : 1}>
                  <Table.Td>{overallLap}</Table.Td>

                  <Table.Td>{stintIndex + 1}</Table.Td>

                  <Table.Td>{lapIndex + 1}</Table.Td>

                  <Table.Td>{kartName}</Table.Td>

                  <Table.Td ff="monospace">{formatTime(lap.timeWithPenalties, 'lap')}</Table.Td>

                  <Table.Td>
                    {penaltyMs > 0 && (
                      <Text c="red" fz="sm" ff="monospace">
                        {penaltyMs / 1000}s
                      </Text>
                    )}
                  </Table.Td>

                  <Table.Td>{lap.cones}</Table.Td>

                  <Table.Td>{lap.gates}</Table.Td>

                  <Table.Td>
                    {new Date(lap.timestamp).toLocaleTimeString(APP_LANGUAGE, DEFAULT_TIME_FORMAT)}
                  </Table.Td>

                  <Table.Td>
                    {lap.isInvalid && (
                      <Tooltip label="Ungültige Runde" withArrow>
                        <IconFlagX
                          size={18}
                          style={{
                            cursor: 'help',
                          }}
                        />
                      </Tooltip>
                    )}
                  </Table.Td>
                </Table.Tr>
              );
            });
          });

          return (
            <div key={driver.uuid}>
              <Divider
                mt="xl"
                mb="md"
                label={`${driver.firstName} ${driver.lastName}`}
                labelPosition="center"
              />

              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>#</Table.Th>
                    <Table.Th>Stint</Table.Th>
                    <Table.Th>Runde</Table.Th>
                    <Table.Th>Kart</Table.Th>
                    <Table.Th>Zeit</Table.Th>
                    <Table.Th>Strafe</Table.Th>
                    <Table.Th>P</Table.Th>
                    <Table.Th>T</Table.Th>
                    <Table.Th>Zeitpunkt</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </div>
          );
        })}
      </PageContent>
    </Layout>
  );
};

export default TrainingViewPage;
