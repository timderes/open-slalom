import Layout from "@/components/shared/Layout";
import PageContent from "@/components/shared/PageContent";
import database from "@/lib/database";
import { formatTime } from "@/lib/time/formatTime";
import {
  getDiffToBest,
  getDiffToPrevious,
  getDriverFastestLap,
  getDriverRanking,
  getFastestLapTimestamp,
  getKartByStint,
  getKartDisplayName,
} from "@/lib/training/selectors";
import { Badge, Code, Stack, Table, Text, Title } from "@mantine/core";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/router";

const TrainingViewPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  if (!uuid) {
    return (
      <Layout currentRoute="/trainings">
        <PageContent>
          <Title>Training konnte nicht geladen werden!</Title>
          <Text>
            Starten Sie die App neu und versuchen Sie das Training erneut zu
            öffnen. Wenn das Problem weiterhin besteht, könnte die
            Trainingsdatei beschädigt sein.
          </Text>
        </PageContent>
      </Layout>
    );
  }

  const training = useLiveQuery(() => database.trainings.get(uuid.toString()));
  const availableKarts = useLiveQuery(() => database.karts.toArray(), []) ?? [];

  if (!training) {
    return (
      <Layout currentRoute="/trainings">
        <PageContent>
          <Title>Training nicht gefunden!</Title>
          <Text>
            Das Training mit der UUID <Code>{uuid}</Code> konnte nicht gefunden.
            Es könnte gelöscht worden sein oder die UUID ist ungültig.
          </Text>
        </PageContent>
      </Layout>
    );
  }

  const rankedDrivers = getDriverRanking(training.drivers, availableKarts);

  return (
    <Layout currentRoute="/trainings">
      <PageContent>
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
              <Table.Th>Kart</Table.Th>
              <Table.Th>Bestzeit</Table.Th>
              <Table.Th>Abstand</Table.Th>
              <Table.Th>Intervall</Table.Th>
              <Table.Th>Runden</Table.Th>
              <Table.Th>Zeitpunkt</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rankedDrivers.map(({ driver, kart }, index) => {
              const fastestLap = getDriverFastestLap(driver);
              const diffToBest = getDiffToBest(driver, training.drivers);
              const diffToPrevious = getDiffToPrevious(
                driver,
                training.drivers,
              );
              const fastestLapTimestamp = getFastestLapTimestamp(driver);

              return (
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
                  <Table.Td>{getKartDisplayName(kart)}</Table.Td>
                  <Table.Td>
                    <Text
                      ff="monospace"
                      fw="bold"
                      c={index === 0 ? "grape" : ""}
                    >
                      {fastestLap
                        ? formatTime(fastestLap.time_with_penalties, "lap")
                        : "N/A"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {diffToBest !== undefined
                      ? formatTime(diffToBest, "gap")
                      : "N/A"}
                  </Table.Td>
                  <Table.Td>
                    {diffToPrevious !== undefined
                      ? formatTime(diffToPrevious, "gap")
                      : "N/A"}
                  </Table.Td>
                  <Table.Td>
                    {driver.stints.length * training.lapsPerStint}
                  </Table.Td>
                  <Table.Td>
                    {fastestLapTimestamp
                      ? new Date(fastestLapTimestamp).toLocaleTimeString("de", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "N/A"}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>

        {/* Tables for each driver with all Laps + penalties and timestamps */}
        {rankedDrivers.map(({ driver }) => {
          const rows = driver.stints.flatMap((stint, stintIndex) =>
            stint.laps.map((lap, lapIndex) => {
              const overallLap =
                stintIndex * training.lapsPerStint + lapIndex + 1;
              const kartName = getKartDisplayName(
                getKartByStint(stint, availableKarts),
              );

              return (
                <Table.Tr key={`${driver.uuid}-${stintIndex}-${lapIndex}`}>
                  <Table.Td>{overallLap}</Table.Td>
                  <Table.Td>{stintIndex + 1}</Table.Td>
                  <Table.Td>{lapIndex + 1}</Table.Td>
                  <Table.Td>{kartName}</Table.Td>
                  <Table.Td>
                    <Badge ff="monospace">
                      {formatTime(lap.time_with_penalties, "lap")}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{lap.cones}</Table.Td>
                  <Table.Td>{lap.gates}</Table.Td>
                  {/*<Table.Td>{formatTime(penaltyMs, "gap")}</Table.Td>*/}
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
                    <Table.Th>Kart</Table.Th>
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
      </PageContent>
    </Layout>
  );
};

export default TrainingViewPage;
