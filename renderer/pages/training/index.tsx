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
import { IconUserMinus, IconUserPlus } from "@tabler/icons-react";
import convertTimeToString from "@/lib/training/convertTimeToString";
import PageHeader from "@/components/shared/PageHeader";

type DriverWithTrainingData = Driver & {
  bestLapTime: number;
  lastLapTime: number;
  totalLaps: number;
  cones: number;
  gates: number;
  laps: { time: number; cones: number; gates: number }[];
};

const TrainingPage = () => {
  const stopwatch = useStopwatch();
  const [finishedLaps, setFinishedLaps] = useState<{ time: number }[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [currentDriverIndex, setCurrentDriverIndex] = useState(0);
  const drivers = useLiveQuery(() => database.drivers.toArray(), []);
  const [opened, { open, close }] = useDisclosure(false);
  const [activeDriver, setActiveDriver] = useState<DriverWithTrainingData[]>(
    []
  );

  useEffect(() => {
    const updateElapsed = () => setElapsed(stopwatch.getElapsedRunningTime());
    setElapsed(stopwatch.getElapsedRunningTime());
    const interval = setInterval(updateElapsed, 100);
    return () => clearInterval(interval);
  }, [stopwatch]);
  const form = useForm({
    initialValues: {
      laps: 3,
    },
  });

  const handleCrossingFinishline = () => {
    const lapTime = stopwatch.getElapsedRunningTime();
    console.log(`Lap ${finishedLaps.length + 1} time:`, lapTime);
    stopwatch.stop();

    if (finishedLaps.length + 1 < form.values.laps) {
      setFinishedLaps((prev) => [...prev, { time: lapTime }]);
      stopwatch.start();
    } else if (finishedLaps.length + 1 === form.values.laps) {
      setFinishedLaps((prev) => [...prev, { time: lapTime }]);
      // Timer stays stopped, all laps are available
    }
  };

  const isLastDriver = currentDriverIndex === activeDriver.length - 1;

  const handleUpdateCurrentDriver = () => {
    if (!isLastDriver) {
      setCurrentDriverIndex((index) => index + 1);
    } else {
      setCurrentDriverIndex(0);
    }

    // SAVE

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
              {activeDriver.includes(driver) ? (
                <Button
                  ms="auto"
                  variant="light"
                  color="red"
                  onClick={() =>
                    setActiveDriver(activeDriver.filter((d) => d !== driver))
                  }
                >
                  <IconUserMinus />
                </Button>
              ) : (
                <Button
                  ms="auto"
                  variant="light"
                  onClick={() => setActiveDriver([...activeDriver, driver])}
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
          <Grid>
            <Grid.Col span={7}>
              Runden:
              <NumberInput
                min={1}
                defaultValue={3}
                max={99}
                {...form.getInputProps("laps")}
              />
              <Button onClick={open}>Fahrer Management</Button>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Fahrer</Table.Th>
                    <Table.Th>Kart</Table.Th>
                    <Table.Th>Beste Zeit</Table.Th>
                    <Table.Th>Letzte Zeit</Table.Th>
                    <Table.Th>Runden</Table.Th>
                    <Table.Th>Pylonen</Table.Th>
                    <Table.Th>Tore</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {activeDriver.map((driver, index) => (
                    <Table.Tr
                      key={driver.uuid}
                      bg={index === currentDriverIndex ? "blue" : ""}
                      c={index === currentDriverIndex ? "white" : ""}
                    >
                      <Table.Td>
                        {driver.firstName} {driver.lastName}
                      </Table.Td>
                      <Table.Td>UNDEFINED</Table.Td>
                      <Table.Td>{convertTimeToString(0)}</Table.Td>
                      <Table.Td>{convertTimeToString(0)}</Table.Td>
                      <Table.Td>{0}</Table.Td>
                      <Table.Td>{0}</Table.Td>
                      <Table.Td>{0}</Table.Td>
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
                  disabled={stopwatch.isRunning()}
                  size="xl"
                  onClick={() => stopwatch.start()}
                >
                  Start
                </Button>
                <Button size="xl" onClick={() => handleCrossingFinishline()}>
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
                onClick={() => handleUpdateCurrentDriver()}
                disabled={finishedLaps.length !== form.values.laps}
              >
                Nächster Fahrer
              </Button>
              <Button onClick={() => handleSkipCurrentDriver()}>
                Fahrer überspringen
              </Button>
              <Button onClick={() => handleEndTraining()} color="red">
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
