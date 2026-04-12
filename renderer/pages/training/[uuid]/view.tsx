import Layout from "@/components/shared/Layout";
import database from "@/lib/database";
import convertTimeToString from "@/lib/training/convertTimeToString";
import {
  Badge,
  Code,
  Container,
  Group,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/router";

const TrainingViewPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  if (!uuid) {
    return (
      <Layout currentRoute="/training/[uuid]/view">
        <Title>Training konnte nicht geladen werden!</Title>
        <Text>
          Starten Sie die App neu und versuchen Sie das Training erneut zu
          öffnen. Wenn das Problem weiterhin besteht, könnte die Trainingsdatei
          beschädigt sein.
        </Text>
      </Layout>
    );
  }

  const training = useLiveQuery(() => database.trainings.get(uuid.toString()));

  if (!training) {
    return (
      <Layout currentRoute="/training/[uuid]/view">
        <Title>Training nicht gefunden!</Title>
        <Text>
          Das Training mit der UUID <Code>{uuid}</Code> konnte nicht gefunden.
          Es könnte gelöscht worden sein oder die UUID ist ungültig.
        </Text>
      </Layout>
    );
  }

  const getBestLapTime = (driver: DriverWithStints) => {
    let bestLapTime: number | null = null;

    driver.stints.forEach((stint) => {
      stint.laps.forEach((lap) => {
        if (bestLapTime === null || lap.time_with_penalties < bestLapTime) {
          bestLapTime = lap.time_with_penalties;
        }
      });
    });

    return bestLapTime;
  };

  const sortDriversByBestLapTime = (drivers: DriverWithStints[]) => {
    return drivers.sort((a, b) => {
      const bestLapA = getBestLapTime(a);
      const bestLapB = getBestLapTime(b);

      if (bestLapA === null && bestLapB === null) return 0;
      if (bestLapA === null) return 1;
      if (bestLapB === null) return -1;
      return bestLapA - bestLapB;
    });
  };

  const getDifferenceToBestLap = (driver: DriverWithStints) => {
    const bestLapTime = getBestLapTime(driver);
    if (bestLapTime === null) return null;
    const bestLapTimeInTraining = Math.min(
      ...training.drivers.map((d) => {
        const bestLap = getBestLapTime(d);
        return bestLap !== null ? bestLap : Infinity;
      }),
    );
    return bestLapTime - bestLapTimeInTraining;
  };

  /**
   * Returns the time difference to the driver directly ahead in the sorted list.
   * For the first driver, this will return 0.
   */
  const getDifferenceToNextDriver = (driver: DriverWithStints) => {
    const sortedDrivers = sortDriversByBestLapTime(training.drivers);
    const index = sortedDrivers.findIndex((d) => d.uuid === driver.uuid);
    if (index === -1) return null;
    if (index === 0) return 0; // No driver ahead, so difference is 0
    const bestLapTime = getBestLapTime(driver);
    const bestLapTimeOfNextDriver = getBestLapTime(sortedDrivers[index - 1]);
    if (bestLapTime === null || bestLapTimeOfNextDriver === null) return null;
    return bestLapTime - bestLapTimeOfNextDriver;
  };

  const sortiedDrivers = training
    ? sortDriversByBestLapTime(training.drivers)
    : [];

  const getTimestampForFastestLap = (driver: DriverWithStints) => {
    let fastestLapTime: number | null = null;
    let fastestLapTimestamp: number | null = null;

    driver.stints.forEach((stint) => {
      stint.laps.forEach((lap) => {
        if (
          fastestLapTime === null ||
          lap.time_with_penalties < fastestLapTime
        ) {
          fastestLapTime = lap.time_with_penalties;
          fastestLapTimestamp = lap.timestamp;
        }
      });
    });

    return fastestLapTimestamp
      ? new Date(fastestLapTimestamp).toLocaleTimeString("de", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "N/A";
  };

  return (
    <Layout currentRoute="/training/[uuid]/view">
      <Container my="lg">
        <Stack>
          <Title>
            {training.mode}-Training am{" "}
            {new Date(training.createdAt).toLocaleDateString("de", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Title>
          <Stack>
            <Badge>{training.drivers.length} Fahrer</Badge>
            <Text c="dimmed">
              Gestartet:{" "}
              {new Date(training.createdAt).toLocaleTimeString("de", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}{" "}
              &ndash; Beendet:{" "}
              {new Date(training.updatedAt).toLocaleTimeString("de", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </Text>
          </Stack>

          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>Klasse</Table.Th>
                <Table.Th>Fahrer</Table.Th>
                <Table.Th>Bestzeit</Table.Th>
                <Table.Th>Abstand</Table.Th>
                <Table.Th>Intervall</Table.Th>
                <Table.Th>Runden</Table.Th>
                <Table.Th>Zeitpunkt</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortiedDrivers.map((driver, index) => (
                <Table.Tr key={driver.uuid}>
                  <Table.Td>{index + 1}.</Table.Td>
                  <Table.Td>
                    K
                    {training.mode === "JKS"
                      ? (driver.driverClass?.jks ?? 7)
                      : (driver.driverClass?.sks ?? 5)}
                  </Table.Td>
                  <Table.Td>
                    {driver.firstName} {driver.lastName}
                  </Table.Td>
                  <Table.Td>
                    <Text
                      ff="monospace"
                      fw="bold"
                      c={index === 0 ? "grape" : ""}
                    >
                      {convertTimeToString(
                        getBestLapTime(driver) !== null
                          ? getBestLapTime(driver)
                          : 0,
                      )}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    +
                    {convertTimeToString(
                      getDifferenceToBestLap(driver) !== null
                        ? getDifferenceToBestLap(driver)
                        : 0,
                    )}
                  </Table.Td>
                  <Table.Td>
                    +
                    {convertTimeToString(
                      getDifferenceToNextDriver(driver) !== null
                        ? getDifferenceToNextDriver(driver)
                        : 0,
                    )}
                  </Table.Td>
                  <Table.Td>
                    {driver.stints.length * training.lapsPerStint}
                  </Table.Td>
                  <Table.Td>{getTimestampForFastestLap(driver)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {/* Tables for each driver with all Laps + penalties and timestamps */}
          {sortiedDrivers.map((driver) => {
            const rows = driver.stints.flatMap((stint, stintIndex) =>
              stint.laps.map((lap, lapIndex) => {
                const overallLap =
                  stintIndex * training.lapsPerStint + lapIndex + 1;
                const penaltyMs = Math.max(
                  0,
                  lap.time_with_penalties - lap.time,
                );

                return (
                  <Table.Tr key={`${driver.uuid}-${stintIndex}-${lapIndex}`}>
                    <Table.Td>{overallLap}</Table.Td>
                    <Table.Td>{stintIndex + 1}</Table.Td>
                    <Table.Td>{lapIndex + 1}</Table.Td>
                    <Table.Td>
                      <Badge ff="monospace">
                        {convertTimeToString(lap.time_with_penalties)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{lap.cones}</Table.Td>
                    <Table.Td>{lap.gates}</Table.Td>
                    {/*<Table.Td>{convertTimeToString(penaltyMs)}</Table.Td>*/}
                    <Table.Td>
                      {new Date(lap.timestamp).toLocaleTimeString("de", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </Table.Td>
                  </Table.Tr>
                );
              }),
            );

            return (
              <div key={driver.uuid}>
                <Title order={4} mt="md">
                  {driver.firstName} {driver.lastName} — Runden
                </Title>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>#</Table.Th>
                      <Table.Th>Stint</Table.Th>
                      <Table.Th>Runde</Table.Th>
                      <Table.Th>Zeit</Table.Th>
                      <Table.Th>Pylonen-Fehler</Table.Th>
                      <Table.Th>Tor-Fehler</Table.Th>
                      {/*<Table.Th>Strafzeit</Table.Th>*/}
                      <Table.Th>Zeitpunkt</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </div>
            );
          })}
        </Stack>
      </Container>
    </Layout>
  );
};

export default TrainingViewPage;
