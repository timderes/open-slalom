import Layout from "@/components/shared/Layout";
import {
  Button,
  ButtonGroup,
  Card,
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
import { useDisclosure, useInterval } from "@mantine/hooks";
import { useStopwatch } from "react-use-precision-timer";
import convertTimeToString from "@/lib/training/convertTimeToString";
import {
  IconAlertSquareRounded,
  IconClockOff,
  IconFlag,
  IconRotate360,
  IconStopwatch,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { TIME_PENALTIES_JKS } from "@/lib/constants";

const LAPS_PER_STINT = 3;

const TrainingPage = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const stopwatch = useStopwatch();
  const [currentStint, setCurrentStint] = useState<{
    currentLap: number;
    driver: Driver;
    laps: Lap[];
    time: number;
  }>({
    currentLap: 1,
    driver: {
      firstName: "Max",
      lastName: "Verstappen",
      uuid: "1234",
      birthDate: "1997-09-30",
      sex: "male", // or "female", depending on your data
      driverClass: { jks: 7, sks: 5 }, // replace with appropriate class value
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    laps: [],
    time: 0,
  });
  const interval = useInterval(
    () =>
      setCurrentStint((prev) => ({
        ...prev,
        time: stopwatch.getElapsedRunningTime(),
      })),
    50 // TODO: Magic value. Add settings slider for this
  );

  useEffect(() => {
    if (stopwatch.isRunning()) {
      interval.start();
    } else {
      interval.stop();
    }
    return () => {
      interval.stop();
    };
  }, [stopwatch.isRunning()]);

  const IS_FINAL_LAP_IN_THIS_STINT = currentStint.currentLap === LAPS_PER_STINT;

  const handleStopwatchStart = () => {
    // Stop the watch to reset the elapsed time and then start it again
    stopwatch.stop();
    stopwatch.start();
  };

  const handleStopwatchReset = () => {
    stopwatch.stop();
    setCurrentStint((prev) => ({ ...prev, laps: [], time: 0, currentLap: 1 }));
  };

  const handleStopwatchLap = () => {
    setCurrentStint((prev) => ({
      ...prev,
      currentLap: IS_FINAL_LAP_IN_THIS_STINT
        ? prev.currentLap
        : prev.currentLap + 1,
      laps: [
        ...prev.laps,
        {
          time: prev.time,
          timestamp: stopwatch.getStartTime(),
          cones: 0,
          gates: 0,
        },
      ],
    }));

    if (IS_FINAL_LAP_IN_THIS_STINT) {
      stopwatch.stop();

      // TODO: Save stint to driver
    } else {
      stopwatch.stop();
      stopwatch.start();
    }
  };

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        title="Fahrer Management"
      ></Drawer>
      <Layout currentRoute="/training">
        <Container my="sm" fluid>
          <Grid>
            <Grid.Col bg="violet" span={12}>
              CONTROLS_HEADER
            </Grid.Col>

            <Grid.Col
              bg="pink"
              span={{ lg: 8, base: 12 }}
              order={{ lg: 0, base: 1 }}
              mb="md"
            >
              {JSON.stringify(currentStint, null, 2)}
            </Grid.Col>
            <Grid.Col span={{ lg: 4, base: 12 }} ta="center">
              <Card component={Stack} gap="xl" withBorder>
                <Divider
                  tt="uppercase"
                  label={
                    <>
                      <IconStopwatch />
                      <Text ml="xs">
                        Stoppuhr &mdash; Fahrer:{" "}
                        {currentStint.driver
                          ? `${currentStint.driver.firstName} ${currentStint.driver.lastName}`
                          : "N/A"}
                      </Text>
                    </>
                  }
                  labelPosition="left"
                />
                <Stack gap={0}>
                  <Text ff="monospace" fz="5rem" fw="bold">
                    {convertTimeToString(currentStint.time)}
                  </Text>
                  <Text opacity={0.7}>
                    Runde: {currentStint.currentLap} / {LAPS_PER_STINT}
                  </Text>
                </Stack>
                <Group grow>
                  <ButtonGroup>
                    <Button
                      leftSection={<IconFlag />}
                      disabled={stopwatch.isRunning()}
                      onClick={() => handleStopwatchStart()}
                    >
                      Start
                    </Button>
                    <Button
                      disabled={
                        LAPS_PER_STINT === currentStint.laps.length ||
                        !stopwatch.isRunning()
                      }
                      onClick={() => handleStopwatchLap()}
                    >
                      {IS_FINAL_LAP_IN_THIS_STINT ? "Stop" : "Runde"}
                    </Button>
                  </ButtonGroup>
                  <Button
                    leftSection={<IconClockOff />}
                    w="fit-content"
                    bg="red"
                    onClick={() => handleStopwatchReset()}
                  >
                    Stint löschen
                  </Button>
                </Group>
                <Divider
                  tt="uppercase"
                  label={
                    <>
                      <IconRotate360 />
                      <Text ml="xs">Runden</Text>
                    </>
                  }
                  labelPosition="left"
                />
                <Stack ta="left">
                  <Text opacity={0.7}>
                    Gesamtzeit:{" "}
                    {convertTimeToString(
                      currentStint.laps.reduce(
                        (total, lap) => total + lap.time,
                        0
                      )
                    )}{" "}
                    &mdash; &#x00D8;{" "}
                    {currentStint.laps.length === 0
                      ? "N/A"
                      : convertTimeToString(
                          currentStint.laps.reduce(
                            (total, lap) => total + lap.time,
                            0
                          ) / currentStint.laps.length
                        )}
                  </Text>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Runde</Table.Th>
                        <Table.Th ta="center">Zeit</Table.Th>
                        <Table.Th>Pylonen</Table.Th>
                        <Table.Th>Tore</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {currentStint.laps.map((lap, index) => {
                        const LAP_HAS_PENALTIES =
                          lap.cones !== 0 || lap.gates !== 0;

                        return (
                          <Table.Tr key={index}>
                            <Table.Td>
                              <Group gap={5}>
                                {index + 1}

                                {LAP_HAS_PENALTIES && (
                                  <IconAlertSquareRounded
                                    color="red"
                                    size={24}
                                  />
                                )}
                              </Group>
                            </Table.Td>
                            <Table.Td w={150} ta="center">
                              <Stack gap={0}>
                                <Text component="span">
                                  {convertTimeToString(lap.time)}
                                </Text>
                                {LAP_HAS_PENALTIES && (
                                  <Text component="span" fz="xs" opacity={0.9}>
                                    +
                                    {lap.cones * TIME_PENALTIES_JKS.HIT_CONE +
                                      lap.gates *
                                        TIME_PENALTIES_JKS.MISSED_GATE}
                                    s
                                  </Text>
                                )}
                              </Stack>
                            </Table.Td>
                            <Table.Td>
                              <NumberInput
                                defaultValue={0}
                                maw={100}
                                min={0}
                                max={99}
                                variant="unstyled"
                                onChange={(val) =>
                                  setCurrentStint((prev) => {
                                    const updatedLaps = [...prev.laps];
                                    updatedLaps[index] = {
                                      ...updatedLaps[index],
                                      cones: (val as number) || 0,
                                    };
                                    return { ...prev, laps: updatedLaps };
                                  })
                                }
                              />
                            </Table.Td>
                            <Table.Td>
                              <NumberInput
                                style={{
                                  color: LAP_HAS_PENALTIES
                                    ? "white"
                                    : undefined,
                                }}
                                defaultValue={0}
                                maw={100}
                                min={0}
                                max={99}
                                variant="unstyled"
                                onChange={(val) =>
                                  setCurrentStint((prev) => {
                                    const updatedLaps = [...prev.laps];
                                    updatedLaps[index] = {
                                      ...updatedLaps[index],
                                      gates: (val as number) || 0,
                                    };
                                    return { ...prev, laps: updatedLaps };
                                  })
                                }
                              />
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </Layout>
    </>
  );
};

export default TrainingPage;
