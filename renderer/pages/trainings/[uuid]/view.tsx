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

const TrainingViewPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  if (!uuid) {
    return (
      <Layout currentRoute="/trainings">
        <PageContent>
          <Title>Training konnte nicht geladen werden!</Title>
          <Text>
            Starten Sie die App neu und versuchen Sie das Training erneut zu öffnen. Wenn das
            Problem weiterhin besteht, könnte die Trainingsdatei beschädigt sein.
          </Text>
        </PageContent>
      </Layout>
    );
  }

  const training = useLiveQuery(() => database.trainings.get(uuid.toString()), [uuid], undefined);
  const karts = useLiveQuery(() => database.karts.toArray(), [], undefined);

  if (training === undefined || karts === undefined) {
    return (
      <Layout currentRoute="/trainings">
        <PageContent>
          <Skeleton height={32} radius="sm" />
          <Skeleton height={12} mt={6} radius="sm" />
          <Skeleton height={12} mt={6} width="70%" radius="sm" />
          <Skeleton height={400} mt={20} radius="sm" />
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
            Das Training mit der UUID <Code>{uuid}</Code> existiert nicht mehr.
          </Text>
        </PageContent>
      </Layout>
    );
  }

  const sortiedDrivers = getDriverRanking(training.drivers).map((entry) => entry.driver);

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
            {new Date(training.createdAt).toLocaleTimeString(APP_LANGUAGE, {
              ...DEFAULT_TIME_FORMAT,
            })}{' '}
            &ndash; Beendet:{' '}
            {new Date(training.updatedAt).toLocaleTimeString(APP_LANGUAGE, {
              ...DEFAULT_TIME_FORMAT,
            })}
          </Text>
        </Stack>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>#</Table.Th>
              <Table.Th>Klasse</Table.Th>
              <Table.Th>{/* Gender Indicator */}</Table.Th>
              <Table.Th>Fahrer</Table.Th>
              <Table.Th>Kart</Table.Th>
              <Table.Th>Bestzeit</Table.Th>
              <Table.Th>Abstand</Table.Th>
              <Table.Th>Intervall</Table.Th>
              <Table.Th>&#x2205;-Zeit</Table.Th>
              <Table.Th>Runden</Table.Th>
              <Table.Th>Zeitpunkt</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortiedDrivers.map((driver, index) => {
              const fastestLap = getDriverFastestLap(driver);
              const diffToBest = getDiffToBest(driver, training.drivers);
              const diffToPrevious = getDiffToPrevious(driver, training.drivers);
              const fastestLapTimestamp = getFastestLapTimestamp(driver);
              const kartFastestLap = karts.find((kart) => kart.uuid === driver.kartUuid)?.name;

              return (
                <Table.Tr key={driver.uuid}>
                  <Table.Td>{index + 1}.</Table.Td>
                  <Table.Td>
                    K
                    {(() => {
                      // Preserve the classes as of the training date by shifting the birthDate
                      // so that the age computed against the current date equals the age at
                      // the training date.
                      const trainingMs = new Date(training.createdAt).getTime();
                      const birthMs = new Date(driver.birthDate).getTime();
                      let birthForClass: string = String(driver.birthDate);

                      if (!Number.isNaN(trainingMs) && !Number.isNaN(birthMs)) {
                        const shifted = new Date(Date.now() - (trainingMs - birthMs));
                        birthForClass = shifted.toISOString();
                      }

                      return training.mode === 'JKS'
                        ? getJksClass({ birthDate: birthForClass })
                        : getSksClass({ birthDate: birthForClass });
                    })()}
                  </Table.Td>
                  <Table.Td>{driver.gender === 'female' ? 'D' : undefined}</Table.Td>
                  <Table.Td>
                    {driver.firstName} {driver.lastName}
                  </Table.Td>
                  <Table.Td>{kartFastestLap ?? 'N/A'}</Table.Td>
                  <Table.Td>
                    <Text ff="monospace" fw="bold" c={index === 0 ? 'grape' : ''}>
                      {fastestLap ? formatTime(fastestLap.time_with_penalties, 'lap') : 'N/A'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {diffToBest !== undefined ? formatTime(diffToBest, 'gap') : 'N/A'}
                  </Table.Td>
                  <Table.Td>
                    {diffToPrevious !== undefined ? formatTime(diffToPrevious, 'gap') : 'N/A'}
                  </Table.Td>
                  <Table.Td>
                    {/* Get average lap time, but only the valid laps */}
                    {driver.stints.length > 0
                      ? formatTime(
                          driver.stints.reduce((sum, stint) => {
                            const validLaps = stint.laps.filter((lap) => !lap.isInvalid);
                            const stintTime = validLaps.reduce(
                              (stintSum, lap) => stintSum + lap.time_with_penalties,
                              0,
                            );
                            return sum + stintTime;
                          }, 0) /
                            driver.stints.reduce(
                              (count, stint) =>
                                count + stint.laps.filter((lap) => !lap.isInvalid).length,
                              0,
                            ),
                          'lap',
                        )
                      : 'N/A'}
                  </Table.Td>
                  <Table.Td>
                    {driver.stints.map((stint) => stint.laps.length).reduce((a, b) => a + b, 0)}
                  </Table.Td>
                  <Table.Td>
                    {fastestLapTimestamp
                      ? new Date(fastestLapTimestamp).toLocaleTimeString(APP_LANGUAGE, {
                          ...DEFAULT_TIME_FORMAT,
                        })
                      : 'N/A'}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>

        {/* Tables for each driver with all Laps + penalties and timestamps */}
        {sortiedDrivers.map((driver) => {
          const rows = driver.stints.flatMap((stint, stintIndex) => {
            const kartUsedInStint = karts.find((kart) => kart.uuid === stint.kartUuid)?.name;
            return stint.laps.map((lap, lapIndex) => {
              const overallLap = stintIndex * training.lapsPerStint + lapIndex + 1;
              const penaltyMs = Math.max(0, lap.time_with_penalties - lap.time);

              return (
                <Table.Tr
                  key={`${driver.uuid}-${stintIndex}-${lapIndex}`}
                  opacity={lap.isInvalid ? 0.2 : 1}
                >
                  <Table.Td>{overallLap}</Table.Td>
                  <Table.Td>{stintIndex + 1}</Table.Td>
                  <Table.Td>{lapIndex + 1}</Table.Td>
                  <Table.Td>{kartUsedInStint ?? 'N/A'}</Table.Td>
                  <Table.Td ff="monospace">
                    {formatTime(lap.time_with_penalties, 'lap')} &nbsp;
                  </Table.Td>
                  <Table.Td>
                    {lap.time !== lap.time_with_penalties && (
                      <Text c="red" fz="sm" ff="monospace">
                        {penaltyMs / 1000}s
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>{lap.cones}</Table.Td>
                  <Table.Td>{lap.gates}</Table.Td>
                  <Table.Td>
                    {new Date(lap.timestamp).toLocaleTimeString(APP_LANGUAGE, {
                      ...DEFAULT_TIME_FORMAT,
                    })}
                  </Table.Td>
                  <Table.Td w={18 * 2.5}>
                    {lap.isInvalid ? (
                      <Tooltip label="Ungültige Runde" withArrow>
                        <IconFlagX size={18} style={{ cursor: 'help' }} />
                      </Tooltip>
                    ) : undefined}
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
                    <Table.Th>{/* Invalid Flag */}</Table.Th>
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
