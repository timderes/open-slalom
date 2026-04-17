import Layout from "@/components/shared/Layout";
import {
  ActionIcon,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Container,
  Divider,
  Drawer,
  Grid,
  Group,
  Kbd,
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
import { useHotkeys, useInterval } from "@mantine/hooks";
import { useStopwatch } from "react-use-precision-timer";
import convertTimeToString from "@/lib/training/convertTimeToString";
import {
  trainingReducer,
  type TrainingAction,
} from "@/lib/training/trainingReducer";
import {
  IconAlertCircleFilled,
  IconAlertSquareRounded,
  IconBugFilled,
  IconClockOff,
  IconFlag,
  IconHelmet,
  IconInfoCircleFilled,
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
  const [currentStint, setCurrentStint] = useState<Stint>({
    currentDriverIndex: 0,
    currentLap: 1,
    driver: settings.values.drivers[0] || undefined,
    laps: [],
    time: 0,
  });

  // =========================
  // CONDITIONS
  // =========================
  const hasDriver = !!currentStint.driver;
  const hasDrivers = settings.values.drivers.length > 0;
  const trainingHasFinishedStints = settings.values.drivers.some(
    (driver) => (driver.stints?.length ?? 0) > 0,
  );
  const isRunning = stopwatch.isRunning();
  const isFinished = currentStint.laps.length === settings.values.lapsPerStint;

  // =========================
  // NOTIFICATIONS
  // =========================
  const notifyError = (title: string, message: string) =>
    notifications.show({
      color: "red",
      icon: <IconAlertCircleFilled />,
      title,
      message,
    });

  const notifyInfo = (title: string, message: string) =>
    notifications.show({
      color: "blue",
      icon: <IconInfoCircleFilled />,
      title,
      message,
    });

  /**
   * Returns the tooltip reason for why a button is disabled, based on the current conditions.
   * If there is no reason (button should not be disabled), returns undefined.
   */
  const getDisabledReason = (
    key: "start" | "lap" | "update" | "skip" | "stop",
  ): string | undefined => {
    switch (key) {
      case "start":
        if (isRunning) return "Stoppuhr läuft";
        if (!hasDriver) return "Bitte zuerst einen Fahrer auswählen.";
        if (isFinished) return "Rundenlimit erreicht";
        return undefined;

      case "lap":
        if (!isRunning) return "Stoppuhr nicht gestartet";
        if (isFinished) return "Rundenlimit erreicht";
        return undefined;

      case "update":
        if (isRunning) return "Stoppuhr läuft";
        if (!isFinished) return "Stint unvollständig";
        return undefined;

      case "skip":
        if (isRunning) return "Stoppuhr läuft";
        if (!hasDrivers) return "Keine Fahrer ausgewählt";
        return undefined;

      case "stop":
        return isRunning ? "Stoppuhr läuft" : undefined;

      default:
        return undefined;
    }
  };

  const applyCurrentStintReducerAction = (action: TrainingAction) => {
    setCurrentStint((prev) => {
      const nextState = trainingReducer(
        {
          drivers: settings.values.drivers,
          currentDriverIndex: prev.currentDriverIndex,
          currentDriver: prev.driver,
          laps: prev.laps,
          currentLap: prev.currentLap,
          lapsPerStint: settings.values.lapsPerStint,
          time: prev.time,
          isRunning,
        },
        action,
      );

      return {
        currentDriverIndex: nextState.currentDriverIndex,
        currentLap: nextState.currentLap,
        driver: nextState.currentDriver,
        laps: nextState.laps,
        time: nextState.time,
      };
    });
  };

  // =========================
  // HOTKEYS
  // =========================
  useHotkeys([
    ["Q", () => handleStopwatchStart()],
    ["W", () => handleStopwatchLap()],
    ["E", () => handleStopwatchReset()],
    ["CTRL+S", () => handleUpdateCurrentDriver()],
    ["CTRL+D", () => handleSkipDriver()],
    ["ESC", () => handleStopTraining()],
  ]);

  const interval = useInterval(
    () =>
      setCurrentStint((prev) => ({
        ...prev,
        time: stopwatch.getElapsedRunningTime(),
      })),
    // TODO: Let the user configure this value in settings
    DEFAULT_STOPWATCH_INTERVAL,
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
    if (!hasDriver) {
      notifyError("Kein Fahrer", "Bitte zuerst einen Fahrer auswählen.");
      return;
    }

    if (stopwatch.isRunning()) {
      notifyError(
        "Stoppuhr läuft bereits",
        "Die Stoppuhr ist bereits gestartet.",
      );
      return;
    }

    if (isFinished) {
      notifyError(
        "Der Stint ist abgeschlossen",
        "Der Fahrer hat bereits alle Runden gefahren. Bitte nächsten Fahrer auswählen oder Stint zurücksetzen.",
      );
      return;
    }

    // Stop the watch to reset the elapsed time and then start it again
    stopwatch.stop();
    stopwatch.start();
  };

  const handleStopwatchReset = () => {
    const hasProgress =
      currentStint.laps.length > 0 ||
      stopwatch.getElapsedRunningTime() > 0 ||
      isRunning;

    if (hasProgress) {
      modals.openConfirmModal({
        title: "Stint wirklich löschen?",
        centered: true,
        children: (
          <Text>
            Alle Runden gehen verloren. Dies kann nicht rückgängig gemacht
            werden.
          </Text>
        ),
        labels: { confirm: "Stint löschen", cancel: "Abbrechen" },
        confirmProps: { color: "red" },
        onConfirm: () => {
          stopwatch.stop();
          applyCurrentStintReducerAction({ type: "RESET" });
          notifyInfo("Stint gelöscht", "Alle Runden wurden zurückgesetzt.");
        },
      });
      return;
    }

    // no progress — reset immediately
    stopwatch.stop();
    applyCurrentStintReducerAction({ type: "RESET" });
    notifyInfo("Stint gelöscht", "Alle Runden wurden zurückgesetzt.");
  };

  const handleStopwatchLap = () => {
    if (!isRunning) {
      notifyError("Stoppuhr nicht gestartet", "Bitte zuerst Start drücken.");
      return;
    }

    setCurrentStint((prev) => ({
      ...prev,
      currentLap: IS_FINAL_LAP_IN_THIS_STINT
        ? prev.currentLap
        : prev.currentLap + 1,
      laps: [
        ...prev.laps,
        {
          time: prev.time,
          time_with_penalties: prev.time,
          timestamp: stopwatch.getStartTime(),
          cones: 0,
          gates: 0,
          isInvalid: false,
        },
      ],
    }));

    //  Stop restarting the stopwatch when this was the final lap in this stint
    if (IS_FINAL_LAP_IN_THIS_STINT) {
      stopwatch.stop();
      notifyInfo("Stint beendet", "Alle Runden abgeschlossen.");
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
    if (!hasDriver) {
      notifyError("Kein Fahrer", "Es ist kein Fahrer aktiv.");
      return;
    }

    if (!isFinished) {
      notifyError(
        "Stint unvollständig",
        "Es müssen alle Runden beendet werden, bevor zum nächsten Fahrer gewechselt werden kann.",
      );
      return;
    }

    settings.setFieldValue("drivers", (prevDrivers) =>
      prevDrivers.map((driver) =>
        driver.uuid === currentStint.driver?.uuid
          ? {
              ...driver,
              stints: [...(driver.stints ?? []), { laps: currentStint.laps }],
              updatedAt: Date.now(),
            }
          : driver,
      ),
    );

    updateCurrentStateToNextDriver();
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
    if (!hasDrivers) return;

    // Can't skip if there is an active stint with progress, as this would lead
    // to lost data without confirmation
    //
    // The button is also disabled, this is code can only be reached through hotkey
    if (isRunning) {
      return;
    }

    // Warn the user about lost data when skipping a driver with progress in their current stint
    if (currentStint.laps.length > 0) {
      modals.openConfirmModal({
        title: "Fahrer wirklich überspringen?",
        centered: true,
        children: (
          <Text>
            Alle Runden des aktuellen Fahrers gehen verloren. Wirklich
            überspringen?
          </Text>
        ),
        labels: { confirm: "Fahrer überspringen", cancel: "Abbrechen" },
        confirmProps: { color: "red" },
        onConfirm: () => updateCurrentStateToNextDriver(),
      });
    } else {
      // No significant progress, skip immediately
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
        // Without drivers or finished stints there is no point in saving the training
        if (!hasDrivers || !trainingHasFinishedStints) {
          notifyError(
            "Das Training wurde nicht gespeichert",
            "Trainings ohne Fahrer oder abgeschlossene Stints werden nicht gespeichert.",
          );
          router.push("/");
          return;
        }

        database.trainings
          .add(settings.values)
          .then(() =>
            router
              .push("/")
              .then(() =>
                notifyInfo(
                  "Training gespeichert",
                  "Das Training wurde erfolgreich gespeichert.",
                ),
              ),
          )
          .catch((error) =>
            notifyError(
              "Training konnte nicht gespeichert werden",
              error?.message || "Unbekannter Fehler",
            ),
          );
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
                      (d) => d.uuid === driver.uuid,
                    );
                    handleAddDriver({
                      ...driver,
                      stints: existing ? existing.stints : [],
                    });
                  }}
                >
                  {settings.values.drivers.some(
                    (d) => d.uuid === driver.uuid,
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
          <Divider label="CONDITIONS" />
          <pre>
            {JSON.stringify(
              {
                hasDriver: hasDriver,
                hasDrivers: hasDrivers,
                isRunning: isRunning,
                isFinished: isFinished,
                trainingHasFinishedStints: trainingHasFinishedStints,
              },
              null,
              2,
            )}
          </pre>
        </Drawer>
      </Drawer.Stack>
      <Layout currentRoute="/training" disableNavbar>
        <Container py="sm" fluid>
          <Grid>
            <Grid.Col span={12}>
              <Group>
                <Title>{settings.values.mode}-Training</Title>
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
                    <Tooltip
                      label={getDisabledReason("update")}
                      disabled={!getDisabledReason("update")}
                      withArrow
                    >
                      <Button
                        size="compact-md"
                        disabled={isRunning || !isFinished}
                        onClick={() => handleUpdateCurrentDriver()}
                      >
                        Nächster Fahrer{" "}
                        <Kbd size="xs" ms="xs">
                          STRG+S
                        </Kbd>
                      </Button>
                    </Tooltip>
                    <Tooltip
                      label={getDisabledReason("skip")}
                      disabled={!getDisabledReason("skip")}
                      withArrow
                    >
                      <Button
                        color="red"
                        size="compact-md"
                        disabled={isRunning || !hasDrivers}
                        onClick={() => handleSkipDriver()}
                      >
                        Fahrer überspringen{" "}
                        <Kbd size="xs" ms="xs">
                          STRG+D
                        </Kbd>
                      </Button>
                    </Tooltip>
                    <Tooltip
                      label={getDisabledReason("stop")}
                      disabled={!getDisabledReason("stop")}
                      withArrow
                    >
                      <Button
                        color="red"
                        size="compact-md"
                        disabled={isRunning}
                        onClick={() => handleStopTraining()}
                      >
                        Training beenden{" "}
                        <Kbd size="xs" ms="xs">
                          ESC
                        </Kbd>
                      </Button>
                    </Tooltip>
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
                                <Table.Td>N/A</Table.Td>
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
                          "Rundenzeit",
                          "Diff.",
                          "Strafen",
                          "Zeitpunkt",
                          "Runden",
                        ],
                        body: (() => {
                          // compute fastest lap per driver and sort ascending (best time first)
                          const driversWithFastest =
                            settings.values.drivers.map((driver) => {
                              const allLaps = (driver.stints ?? []).flatMap(
                                (stint) => stint.laps ?? [],
                              );
                              const fastestLap = allLaps.length
                                ? allLaps.reduce(
                                    (fastest, lap) =>
                                      lap.time_with_penalties <
                                      fastest.time_with_penalties
                                        ? lap
                                        : fastest,
                                    allLaps[0],
                                  )
                                : undefined;
                              return { driver, fastestLap };
                            });

                          driversWithFastest.sort((a, b) => {
                            const aTime =
                              a.fastestLap?.time_with_penalties ?? Infinity;
                            const bTime =
                              b.fastestLap?.time_with_penalties ?? Infinity;
                            return aTime - bTime;
                          });

                          return driversWithFastest.map(
                            ({ driver, fastestLap }, idx) => {
                              const pos = `${idx + 1}.`;
                              const name = `${driver.firstName} ${driver.lastName}`;
                              const kart = (driver as any).kart ?? "N/A";
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
                                    fastestLap.time_with_penalties,
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
                                          bestTime,
                                      )}`
                                  : "N/A";

                              const date = fastestLap
                                ? new Date(fastestLap.timestamp)
                                    .toTimeString()
                                    .split(" ")[0]
                                : "N/A";

                              const totalRounds = (driver.stints ?? []).flatMap(
                                (stint) => stint.laps ?? [],
                              ).length;

                              return [
                                pos,
                                name,
                                kart,
                                timeStr,
                                diffToBest,
                                penalties,
                                date,
                                totalRounds,
                              ];
                            },
                          );
                        })(),
                      }}
                    />
                  </Tabs.Panel>
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
                    <Tooltip
                      label={getDisabledReason("start")}
                      disabled={!getDisabledReason("start")}
                      withArrow
                    >
                      <div style={{ display: "inline-block" }}>
                        <Button
                          leftSection={<IconFlag />}
                          disabled={isRunning || !hasDriver || isFinished}
                          onClick={() => handleStopwatchStart()}
                        >
                          Start{" "}
                          <Kbd size="xs" ms="xs">
                            Q
                          </Kbd>
                        </Button>
                      </div>
                    </Tooltip>

                    <Tooltip
                      label={getDisabledReason("lap")}
                      disabled={!getDisabledReason("lap")}
                      withArrow
                    >
                      <div style={{ display: "inline-block" }}>
                        <Button
                          disabled={isFinished || !isRunning}
                          onClick={() => handleStopwatchLap()}
                        >
                          {IS_FINAL_LAP_IN_THIS_STINT ? "Stop" : "Runde"}{" "}
                          <Kbd size="xs" ms="xs">
                            W
                          </Kbd>
                        </Button>
                      </div>
                    </Tooltip>
                  </ButtonGroup>
                  <div style={{ display: "inline-block" }}>
                    <Button
                      leftSection={<IconClockOff />}
                      w="fit-content"
                      bg="red"
                      onClick={() => handleStopwatchReset()}
                    >
                      Stint löschen{" "}
                      <Kbd size="xs" ms="xs">
                        E
                      </Kbd>
                    </Button>
                  </div>
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
                        0,
                      ),
                    )}{" "}
                    &mdash; &#x00D8;{" "}
                    {currentStint.laps.length === 0
                      ? "N/A"
                      : convertTimeToString(
                          currentStint.laps.reduce(
                            (total, lap) => total + lap.time,
                            0,
                          ) / currentStint.laps.length,
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
                          <Table.Th>Ungültig</Table.Th>
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
                                            (val as number) *
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
                                            (val as number) *
                                            TIME_PENALTIES_JKS.MISSED_GATE,
                                      };
                                      return { ...prev, laps: updatedLaps };
                                    })
                                  }
                                />
                              </Table.Td>
                              <Table.Td>
                                <Checkbox
                                  onClick={() =>
                                    setCurrentStint((prev) => {
                                      const updatedLaps = [...prev.laps];
                                      updatedLaps[index] = {
                                        ...updatedLaps[index],
                                        isInvalid:
                                          !updatedLaps[index].isInvalid,
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
