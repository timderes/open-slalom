import Layout from "@/components/shared/Layout";
import {
  Button,
  ButtonGroup,
  Container,
  Divider,
  Drawer,
  Grid,
  Group,
  NumberInput,
  SegmentedControl,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useStopwatch } from "react-use-precision-timer";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { useLiveQuery } from "dexie-react-hooks";
import database from "@/lib/database";
import { useDisclosure } from "@mantine/hooks";
import { IconHelmet, IconUserMinus, IconUserPlus } from "@tabler/icons-react";
import convertTimeToString from "@/lib/training/convertTimeToString";
import PageHeader from "@/components/shared/PageHeader";
import { EMPTY_TRAINING_DATA } from "@/lib/constants";

const TrainingPage = () => {
  const stopwatch = useStopwatch();
  const [finishedLaps, setFinishedLaps] = useState<
    { cones: number; gates: number; time: number }[]
  >([]);
  const [elapsed, setElapsed] = useState(0);
  const [currentDriverIndex, setCurrentDriverIndex] = useState(0);
  const drivers = useLiveQuery(() => database.drivers.toArray(), []);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    const updateElapsed = () => setElapsed(stopwatch.getElapsedRunningTime());
    setElapsed(stopwatch.getElapsedRunningTime());
    const interval = setInterval(updateElapsed, 100);
    return () => clearInterval(interval);
  }, [stopwatch]);
  const training = useForm<Training>({
    initialValues: {
      lapsPerStint: 3,
      mode: "JKS",
      drivers: [],
    },
  });

  const handleCrossingFinishLine = () => {
    stopwatch.pause();

    const currentLapTime = stopwatch.getElapsedRunningTime();

    setFinishedLaps((laps) => [
      ...laps,
      { time: currentLapTime, cones: 0, gates: 0 },
    ]);

    if (finishedLaps.length + 1 >= training.values.lapsPerStint) {
      stopwatch.stop();
    } else {
      stopwatch.start();
    }
  };

  const isLastDriver =
    currentDriverIndex === training.values.drivers.length - 1;

  const handleUpdateCurrentDriver = () => {
    if (!isLastDriver) {
      setCurrentDriverIndex((index) => index + 1);
    } else {
      setCurrentDriverIndex(0);
    }

    // SAVE
    training.setValues((prev) => {
      const currentDriver = prev.drivers[currentDriverIndex];
      currentDriver.laps = [
        ...prev.drivers[currentDriverIndex].laps,
        ...finishedLaps.map((lap) => ({
          time: lap.time,
          cones: lap.cones,
          gates: lap.gates,
        })),
      ];
      currentDriver.totalLaps += finishedLaps.length;

      // Get Best lap time from laps
      currentDriver.bestLapTime = Math.min(
        ...currentDriver.laps.map((lap) => lap.time)
      );

      // get average lap time from laps
      currentDriver.averageLapTime =
        currentDriver.laps.reduce((acc, lap) => acc + lap.time, 0) /
        currentDriver.laps.length;

      return { ...prev };
    });

    console.info(training.values);

    // RESET
    setFinishedLaps([]);
    setElapsed(0);
    stopwatch.stop();
  };

  const handleSkipCurrentDriver = () => {
    if (!isLastDriver) {
      setCurrentDriverIndex((index) => index + 1);
    } else {
      setCurrentDriverIndex(0);
    }

    setFinishedLaps([]);
    setElapsed(0);
    stopwatch.stop();
  };

  const handleEndTraining = () => {
    // TODO: Save data to db and go to index route
    return;
  };

  const handleResetTurn = () => {
    stopwatch.stop();
    setElapsed(0);
    setFinishedLaps([]);
  };
  return (
    <>
      <Drawer opened={opened} onClose={close} title="Fahrer Management">
        <Stack>
          {drivers?.map((driver) => (
            <Group key={driver.uuid}>
              <Text>
                {driver.firstName} {driver.lastName}
              </Text>
              {training.values.drivers.some((d) => d.uuid === driver.uuid) ? (
                <Button
                  ms="auto"
                  variant="light"
                  color="red"
                  onClick={() =>
                    training.setFieldValue(
                      "drivers",
                      training.values.drivers.filter(
                        (d) => d.uuid !== driver.uuid
                      )
                    )
                  }
                >
                  <IconUserMinus />
                </Button>
              ) : (
                <Button
                  ms="auto"
                  variant="light"
                  onClick={() =>
                    training.setFieldValue("drivers", [
                      ...training.values.drivers,
                      { ...driver, ...EMPTY_TRAINING_DATA },
                    ])
                  }
                >
                  <IconUserPlus />
                </Button>
              )}
            </Group>
          ))}
        </Stack>
      </Drawer>
      <Layout currentRoute="/training">
        <Container my="sm" fluid>
          <PageHeader title="Training" />
          {JSON.stringify(training.values)}
          <Grid>
            <Grid.Col span={7}>
              <Group align="end" mb="sm">
                <NumberInput
                  disabled={stopwatch.isRunning()}
                  label="Runden"
                  min={1}
                  defaultValue={3}
                  max={99}
                  {...training.getInputProps("lapsPerStint")}
                />

                <SegmentedControl
                  disabled={stopwatch.isRunning()}
                  color="blue"
                  data={["JKS", "SKS"]}
                  {...training.getInputProps("mode")}
                />
                <Button
                  disabled={stopwatch.isRunning()}
                  leftSection={<IconHelmet />}
                  ms="auto"
                  onClick={open}
                >
                  Fahrer
                </Button>
              </Group>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Fahrer</Table.Th>
                    <Table.Th>Kart</Table.Th>
                    <Table.Th>Beste Zeit</Table.Th>
                    <Table.Th>&#8709; Zeit</Table.Th>
                    <Table.Th>Runden</Table.Th>
                    <Table.Th>Pylonen</Table.Th>
                    <Table.Th>Tore</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {training.values.drivers.map((driver, index) => (
                    <Table.Tr
                      key={driver.uuid}
                      bg={index === currentDriverIndex ? "blue" : ""}
                      c={index === currentDriverIndex ? "white" : ""}
                    >
                      <Table.Td>
                        {driver.firstName} {driver.lastName}
                      </Table.Td>
                      <Table.Td>UNDEFINED</Table.Td>
                      <Table.Td>
                        {convertTimeToString(driver.bestLapTime || 0)}
                      </Table.Td>
                      <Table.Td>
                        {convertTimeToString(driver.averageLapTime || 0)}
                      </Table.Td>
                      <Table.Td>{driver.totalLaps}</Table.Td>
                      <Table.Td>{driver.totalCones}</Table.Td>
                      <Table.Td>{driver.totalGates}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Grid.Col>
            <Grid.Col span={5} component={Stack}>
              <Text ta="center" fz="6rem" fw="bold">
                {convertTimeToString(elapsed)}
              </Text>
              <ButtonGroup mx="auto">
                <Button
                  disabled={
                    stopwatch.isRunning() ||
                    training.values.drivers.length === 0
                  }
                  size="xl"
                  onClick={() => stopwatch.start()}
                >
                  Start
                </Button>
                <Button
                  disabled={!stopwatch.isRunning()}
                  size="xl"
                  onClick={() => handleCrossingFinishLine()}
                >
                  Ziel
                </Button>
                <Button size="xl" color="red" onClick={() => handleResetTurn()}>
                  Zurücksetzen
                </Button>
              </ButtonGroup>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Runde</Table.Th>
                    <Table.Th>Zeit</Table.Th>
                    <Table.Th>Pylonen</Table.Th>
                    <Table.Th>Tore</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {finishedLaps.map((lap, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>{index + 1}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {convertTimeToString(lap.time)}
                          <Text fz="xs" c="red">
                            +0s
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <NumberInput defaultValue={0} min={0} max={99} />
                      </Table.Td>
                      <Table.Td>
                        <NumberInput defaultValue={0} min={0} max={99} />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              <Divider />
              <Button
                disabled={finishedLaps.length !== training.values.lapsPerStint}
                onClick={() => handleUpdateCurrentDriver()}
              >
                Nächster Fahrer
              </Button>
              <Button
                disabled={stopwatch.isRunning()}
                onClick={() => handleSkipCurrentDriver()}
              >
                Fahrer überspringen
              </Button>
              <Button
                disabled={stopwatch.isRunning()}
                onClick={() => handleEndTraining()}
                color="red"
              >
                Training beenden
              </Button>
            </Grid.Col>
          </Grid>
        </Container>
      </Layout>
    </>
  );
};

export default TrainingPage;
