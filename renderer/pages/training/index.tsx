import Layout from "@/components/shared/Layout";
import {
  ActionIcon,
  Button,
  ButtonGroup,
  Card,
  Container,
  Divider,
  Drawer,
  Grid,
  Group,
  NumberInput,
  SegmentedControl,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
  Tooltip,
  useDrawersStack,
} from "@mantine/core";
import { useInterval } from "@mantine/hooks";
import { useStopwatch } from "react-use-precision-timer";
import convertTimeToString from "@/lib/training/convertTimeToString";
import {
  IconAlertSquareRounded,
  IconBugFilled,
  IconClockOff,
  IconFlag,
  // IconGraph,
  IconHelmet,
  IconList,
  IconListNumbers,
  IconRotate360,
  IconSettings,
  IconStopwatch,
  IconUserMinus,
  IconUserPlus,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  DEFAULT_STOPWATCH_INTERVAL,
  TIME_PENALTIES_JKS,
} from "@/lib/constants";
import { useForm } from "@mantine/form";
import { v4 as uuidv4 } from "uuid";
import { useLiveQuery } from "dexie-react-hooks";
import database from "@/lib/database";
import { useRouter } from "next/router";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import ScrollableTable from "@/components/shared/SortableTable";

const TrainingPage = () => {
  const router = useRouter();
  const stack = useDrawersStack(["drivers", "settings", "dev"]);
  const drivers = useLiveQuery(() => database.drivers.toArray(), []);
  const stopwatch = useStopwatch();
  const settings = useForm<Training>({
    initialValues: {
      lapsPerStint: 3,
      drivers: [],
      mode: "JKS",
      uuid: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    onValuesChange: () => {
      settings.setFieldValue("updatedAt", Date.now());
    },
  });
  const [currentStint, setCurrentStint] = useState<{
    currentDriverIndex: number;
    currentLap: number;
    driver: DriverWithStints | undefined;
    laps: Lap[];
    time: number;
  }>({
    currentDriverIndex: 0,
    currentLap: 1,
    driver: settings.values.drivers[0] || undefined,
    laps: [],
    time: 0,
  });

  const interval = useInterval(
    () =>
      setCurrentStint((prev) => ({
        ...prev,
        time: stopwatch.getElapsedRunningTime(),
      })),
    // TODO: Let the user configure this value in settings
    DEFAULT_STOPWATCH_INTERVAL
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

  const IS_FINAL_LAP_IN_THIS_STINT =
    currentStint.currentLap === settings.values.lapsPerStint;

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
          time_with_penalties: 0,
          timestamp: stopwatch.getStartTime(),
          cones: 0,
          gates: 0,
        },
      ],
    }));

    //  Stop restarting the stopwatch when this was the final lap in this stint
    if (IS_FINAL_LAP_IN_THIS_STINT) {
      stopwatch.stop();
    } else {
      stopwatch.stop();
      stopwatch.start();
    }
  };

  const handleAddDriver = (driver: DriverWithStints) => {
    // Use uuid comparison to determine whether the driver is already added,
    // avoiding duplicate entries when different object references are used.
    const exists = settings.values.drivers.some((d) => d.uuid === driver.uuid);
    const updatedDrivers = exists
      ? settings.values.drivers.filter((d) => d.uuid !== driver.uuid)
      : [...settings.values.drivers, driver];

    settings.setFieldValue("drivers", updatedDrivers);

    // If driver list is not empty set current driver to the one at the current index
    setCurrentStint((prev) => ({
      ...prev,
      driver: updatedDrivers[prev.currentDriverIndex] || undefined,
    }));
  };

  const handleUpdateCurrentDriver = () => {
    settings.setFieldValue("drivers", (prevDrivers) =>
      prevDrivers.map((driver) =>
        driver.uuid === currentStint.driver?.uuid
          ? {
              ...driver,
              stints: [
                ...(driver.stints ?? []),
                { laps: [...currentStint.laps] },
              ],
              updatedAt: Date.now(),
            }
          : driver
      )
    );
    // Update current driver index
    setCurrentStint((prev) => ({
      currentDriverIndex:
        (prev.currentDriverIndex + 1) % settings.values.drivers.length,
      currentLap: 1,
      driver:
        settings.values.drivers[
          (prev.currentDriverIndex + 1) % settings.values.drivers.length
        ],
      laps: [],
      time: 0,
    }));
  };

  const updateCurrentStateToNextDriver = () => {
    setCurrentStint((prev) => ({
      currentDriverIndex:
        (prev.currentDriverIndex + 1) % settings.values.drivers.length,
      currentLap: 1,
      driver:
        settings.values.drivers[
          (prev.currentDriverIndex + 1) % settings.values.drivers.length
        ],
      laps: [],
      time: 0,
    }));
  };

  const handleSkipDriver = () => {
    // If the stopwatch for the driver started, ask for confirmation to skip them
    if (currentStint.time !== 0) {
      modals.openConfirmModal({
        title: "Fahrer wirklich überspringen?",
        centered: true,
        children: (
          <Text>
            Die Stoppuhr für den aktuellen Fahrer wurde gestartet! Möchten Sie
            den Fahrer wirklich überspringen? Nicht abgeschlossene Stints werden
            verworfen.
          </Text>
        ),
        labels: { confirm: "Fahrer überspringen", cancel: "Abbrechen" },
        confirmProps: { color: "red" },
        onConfirm: () => updateCurrentStateToNextDriver(),
      });
    } else {
      updateCurrentStateToNextDriver();
    }
  };

  const handleStopTraining = () => {
    modals.openConfirmModal({
      title: "Training beenden?",
      centered: true,
      children: (
        <Text>
          Möchten Sie das Training wirklich beenden? Nicht abgeschlossene Stints
          werden nicht gespeichert!
        </Text>
      ),
      labels: { confirm: "Training beenden", cancel: "Abbrechen" },
      onConfirm: () => {
        // If no drivers or no laps were recorded, do not save the training
        if (
          settings.values.drivers.length === 0 ||
          currentStint.driver.stints.length === 0
        ) {
          notifications.show({
            autoClose: 10000, // 10 seconds
            color: "red",
            title: "Training wurde nicht gespeichert!",
            message:
              "Es wurden keine Fahrer oder keine Rundenzeiten erfasst. Das Training wurde verworfen und nicht gespeichert.",
          });
          router.push("/");
          return;
        }

        // Save training with drivers that have at least one stint with laps
        database.trainings
          .add(settings.values)
          .then(() => {
            router.push("/");
          })
          .catch((error) => {
            notifications.show({
              title: "Training konnte nicht gespeichert werden",
              message: error?.message || "Unbekannter Fehler",
            });
          });
      },
      confirmProps: { color: "red" },
    });
  };

  return (
    <>
      <Drawer.Stack>
        <Drawer
          overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
          size="xl"
          title="Fahrer Management"
          {...stack.register("drivers")}
        >
          <Stack>
            {drivers?.map((driver) => (
              <Group key={driver.uuid}>
                <Text>
                  {driver.firstName} {driver.lastName}
                </Text>
                <ActionIcon
                  color={
                    settings.values.drivers.some((d) => d.uuid === driver.uuid)
                      ? "red"
                      : "blue"
                  }
                  ms="auto"
                  onClick={() => {
                    // Check if driver already was added to the training before and then preserve their stints
                    const existing = settings.values.drivers.find(
                      (d) => d.uuid === driver.uuid
                    );
                    handleAddDriver({
                      ...driver,
                      stints: existing ? existing.stints : [],
                    });
                  }}
                >
                  {settings.values.drivers.some(
                    (d) => d.uuid === driver.uuid
                  ) ? (
                    <IconUserMinus />
                  ) : (
                    <IconUserPlus />
                  )}
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        </Drawer>
        <Drawer
          overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
          size="xl"
          title="Einstellungen"
          {...stack.register("settings")}
        >
          <Stack>
            <NumberInput
              label="Runden"
              description="Anzahl der Runden die jeder Fahrer pro Stint fährt."
              min={1}
              max={99}
              {...settings.getInputProps("lapsPerStint")}
            />
            <Stack gap={0}>
              <Text fz="sm" fw="bold" opacity={0.8}>
                Modus
              </Text>
              <SegmentedControl
                color="blue"
                data={["JKS", "SKS"]}
                value={settings.values.mode}
                onChange={(value) =>
                  settings.setFieldValue("mode", value as SlalomType)
                }
              />
            </Stack>
          </Stack>
        </Drawer>
        <Drawer size="100%" title="Entwickler" {...stack.register("dev")}>
          <Divider label="CURRENT STINT" />
          <pre>{JSON.stringify(currentStint, null, 2)}</pre>
          <Divider label="FORM" />
          <pre>{JSON.stringify(settings.values, null, 2)}</pre>
        </Drawer>
      </Drawer.Stack>
      <Layout currentRoute="/training" disableNavbar>
        <Container py="sm" fluid>
          <Grid>
            <Grid.Col span={12}>
              <Group>
                <Title>Training</Title>
                <Group ms="auto">
                  <Tooltip
                    label="Fahrer"
                    withArrow
                    position="bottom"
                    onClick={() => stack.open("drivers")}
                  >
                    <ActionIcon>
                      <IconHelmet />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip
                    label="Einstellungen"
                    withArrow
                    position="bottom"
                    onClick={() => stack.open("settings")}
                    disabled={stopwatch.isRunning()}
                  >
                    <ActionIcon
                      variant="default"
                      w="fit-content"
                      disabled={
                        currentStint.laps.length > 0 || stopwatch.isRunning()
                      }
                    >
                      <IconSettings />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip
                    label="Entwickler"
                    withArrow
                    position="bottom"
                    onClick={() => stack.open("dev")}
                  >
                    <ActionIcon c="orange" variant="default" w="fit-content">
                      <IconBugFilled />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Grid.Col>
            <Grid.Col
              span={{ lg: 7, base: 12 }}
              order={{ lg: 0, base: 1 }}
              mb="md"
            >
              <Stack>
                <Card withBorder>
                  <Group grow>
                    <Button
                      size="compact-md"
                      disabled={
                        stopwatch.isRunning() ||
                        currentStint.laps.length !==
                          settings.values.lapsPerStint
                      }
                      onClick={() => handleUpdateCurrentDriver()}
                    >
                      Nächster Fahrer
                    </Button>
                    <Button
                      color="red"
                      size="compact-md"
                      disabled={
                        stopwatch.isRunning() ||
                        settings.values.drivers.length === 0
                      }
                      onClick={() => handleSkipDriver()}
                    >
                      Fahrer überspringen
                    </Button>
                    <Button
                      color="red"
                      size="compact-md"
                      disabled={stopwatch.isRunning()}
                      onClick={() => handleStopTraining()}
                    >
                      Training beenden
                    </Button>
                  </Group>
                </Card>
                <Tabs defaultValue="starterList" variant="outline">
                  <Tabs.List>
                    <Tabs.Tab
                      value="starterList"
                      leftSection={<IconList size={16} />}
                    >
                      Starterliste
                    </Tabs.Tab>
                    <Tabs.Tab
                      value="fastestLaps"
                      leftSection={<IconListNumbers size={16} />}
                    >
                      Schnellste Runden
                    </Tabs.Tab>
                    {/*
                    <Tabs.Tab
                      value="stats"
                      leftSection={<IconGraph size={16} />}
                    >
                      Statistiken
                    </Tabs.Tab>
                    */}
                  </Tabs.List>
                  <Tabs.Panel value="starterList" my="lg">
                    {settings.values.drivers.length === 0 ? (
                      <Stack align="center">
                        <Text fz="h4">Es wurden keine Fahrer ausgewählt!</Text>
                        <Button
                          leftSection={<IconHelmet />}
                          w="fit-content"
                          mx="auto"
                          onClick={() => stack.open("drivers")}
                        >
                          Fahrer hinzufügen
                        </Button>
                      </Stack>
                    ) : (
                      <Table.ScrollContainer minWidth="auto" maxHeight={600}>
                        <Table striped highlightOnHover stickyHeader>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Fahrer</Table.Th>
                              <Table.Th>Kart</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {settings.values?.drivers.map((driver, _idx) => (
                              <Table.Tr
                                key={driver.uuid}
                                bg={
                                  currentStint.currentDriverIndex === _idx
                                    ? "blue"
                                    : undefined
                                }
                                c={
                                  currentStint.currentDriverIndex === _idx
                                    ? "white"
                                    : undefined
                                }
                              >
                                <Table.Td>
                                  {driver.firstName} {driver.lastName}
                                </Table.Td>
                                <Table.Td>UNDEFINED</Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Table.ScrollContainer>
                    )}
                  </Tabs.Panel>
                  <Tabs.Panel value="fastestLaps" my="lg">
                    <ScrollableTable
                      striped
                      highlightOnHover
                      withRowBorders={false}
                      data={{
                        head: [
                          "Position",
                          "Fahrer",
                          "Kart",
                          "Strafen",
                          "Rundenzeit",
                          "Diff. (Bestzeit)",
                          "Diff. (Nächster)",
                          "Zeitpunkt",
                        ],
                        body: (() => {
                          // compute fastest lap per driver and sort ascending (best time first)
                          const driversWithFastest =
                            settings.values.drivers.map((driver) => {
                              const allLaps = (driver.stints ?? []).flatMap(
                                (stint) => stint.laps ?? []
                              );
                              const fastestLap = allLaps.length
                                ? allLaps.reduce(
                                    (fastest, lap) =>
                                      lap.time < fastest.time ? lap : fastest,
                                    allLaps[0]
                                  )
                                : undefined;
                              return { driver, fastestLap };
                            });

                          driversWithFastest.sort((a, b) => {
                            const aTime = a.fastestLap?.time ?? Infinity;
                            const bTime = b.fastestLap?.time ?? Infinity;
                            return aTime - bTime;
                          });

                          return driversWithFastest.map(
                            ({ driver, fastestLap }, idx) => {
                              const pos = `${idx + 1}.`;
                              const name = `${driver.firstName} ${driver.lastName}`;
                              const kart = (driver as any).kart ?? "UNDEFINED";
                              const cones = fastestLap?.cones ?? 0;
                              const gates = fastestLap?.gates ?? 0;
                              const penalties =
                                fastestLap !== undefined
                                  ? `${cones}P ${gates}T (+${
                                      cones * TIME_PENALTIES_JKS.HIT_CONE +
                                      gates * TIME_PENALTIES_JKS.MISSED_GATE
                                    }s)`
                                  : "N/A";
                              const timeStr = fastestLap
                                ? convertTimeToString(
                                    fastestLap.time_with_penalties
                                  )
                                : "N/A";

                              const bestTime =
                                driversWithFastest[0]?.fastestLap?.time;
                              const diffToBest =
                                fastestLap !== undefined
                                  ? idx === 0 || bestTime === undefined
                                    ? "-"
                                    : `+${convertTimeToString(
                                        fastestLap.time_with_penalties -
                                          bestTime
                                      )}`
                                  : "N/A";

                              const prevTime =
                                driversWithFastest[idx - 1]?.fastestLap?.time;
                              const diffToPrev =
                                fastestLap !== undefined
                                  ? idx === 0 || prevTime === undefined
                                    ? "-"
                                    : `+${convertTimeToString(
                                        fastestLap.time_with_penalties -
                                          prevTime
                                      )}`
                                  : "N/A";

                              const date = fastestLap
                                ? new Date(fastestLap.timestamp)
                                    .toTimeString()
                                    .split(" ")[0]
                                : "N/A";

                              return [
                                pos,
                                name,
                                kart,
                                penalties,
                                timeStr,
                                diffToBest,
                                diffToPrev,
                                date,
                              ];
                            }
                          );
                        })(),
                      }}
                    />
                  </Tabs.Panel>
                  {/*
                  <Tabs.Panel value="stats" my="lg">
                    TODO_ADD_STATS_CONTENT
                  </Tabs.Panel>
                  */}
                </Tabs>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ lg: 5, base: 12 }} ta="center">
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
                    Runde: {currentStint.currentLap} /{" "}
                    {settings.values.lapsPerStint}
                  </Text>
                </Stack>
                <Group grow>
                  <ButtonGroup>
                    <Button
                      leftSection={<IconFlag />}
                      disabled={stopwatch.isRunning() || !currentStint.driver}
                      onClick={() => handleStopwatchStart()}
                    >
                      Start
                    </Button>
                    <Button
                      disabled={
                        settings.values.lapsPerStint ===
                          currentStint.laps.length || !stopwatch.isRunning()
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
                  <Table.ScrollContainer minWidth="auto" maxHeight={300}>
                    <Table striped highlightOnHover stickyHeader>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Runde</Table.Th>
                          <Table.Th>Zeit</Table.Th>
                          <Table.Th>Zeitstrafe</Table.Th>
                          <Table.Th>Pylonen</Table.Th>
                          <Table.Th>Tore</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {currentStint.laps.map((lap, index) => {
                          const LAP_HAS_PENALTIES =
                            lap.cones !== 0 || lap.gates !== 0;

                          return (
                            <Table.Tr key={lap.timestamp}>
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
                              <Table.Td>
                                <Text component="span">
                                  {convertTimeToString(lap.time)}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                {LAP_HAS_PENALTIES && (
                                  <Text c="red" fw="bold">
                                    +
                                    {lap.cones * TIME_PENALTIES_JKS.HIT_CONE +
                                      lap.gates *
                                        TIME_PENALTIES_JKS.MISSED_GATE}
                                    s
                                  </Text>
                                )}
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
                                        // TODO: ADD SKS SUPPORT
                                        time_with_penalties:
                                          updatedLaps[index].time +
                                          1000 *
                                            ((val as number) || 0) *
                                            TIME_PENALTIES_JKS.HIT_CONE,
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
                                        // TODO: ADD SKS SUPPORT
                                        time_with_penalties:
                                          updatedLaps[index].time +
                                          1000 *
                                            ((val as number) || 0) *
                                            TIME_PENALTIES_JKS.MISSED_GATE,
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
                  </Table.ScrollContainer>
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
