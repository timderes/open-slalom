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
import convertTimeToString from "@/lib/training/convertTimeToString";
import {
  IconAlertSquareRounded,
  IconBugFilled,
  IconClockOff,
  IconFlag,
  IconHelmet,
  IconList,
  IconListNumbers,
  IconRotate360,
  IconSettings,
  IconStopwatch,
  IconUserMinus,
  IconUserPlus,
} from "@tabler/icons-react";
import ScrollableTable from "@/components/shared/SortableTable";
import useTraining from "@/hooks/useTraining";
import {
  getAverageLap,
  getDriverRanking,
  getLapPenaltySeconds,
  getTotalLapTime,
} from "@/lib/training/selectors";
import { useRouter } from "next/router";
import { useEffect } from "react";
import type { TrainingState } from "@/lib/training/trainingReducer";
import { useLocalStorage } from "@mantine/hooks";

const ActiveTrainingPage = () => {
  const stack = useDrawersStack(["drivers", "settings", "dev"]);
  const {
    availableDrivers,
    settings,
    timePenalties,
    currentStint,
    conditions,
    actions,
    getDisabledReason,
  } = useTraining();
  const {
    hasDriver,
    hasDrivers,
    isRunning,
    isFinished,
    trainingHasFinishedStints,
    isFinalLapInThisStint,
  } = conditions;
  const router = useRouter();
  const [restoreBackup] = useLocalStorage<Partial<TrainingState> | undefined>({
    key: "training-backup",
    defaultValue: undefined,
  });

  useEffect(() => {
    if (!router.query.restoreBackup) return;

    if (restoreBackup) {
      actions.restoreBackup(restoreBackup);
    }
  }, [restoreBackup]);

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
            {availableDrivers?.map((driver) => (
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
                    actions.addDriver({
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
                query: router.query,
              },
              null,
              2,
            )}
          </pre>
        </Drawer>
      </Drawer.Stack>
      <Layout currentRoute="/trainings" disableNavbar>
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
                    disabled={isRunning}
                  >
                    <ActionIcon
                      variant="default"
                      w="fit-content"
                      disabled={currentStint.laps.length > 0 || isRunning}
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
                        onClick={() => actions.updateCurrentDriver()}
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
                        onClick={() => actions.skipDriver()}
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
                        onClick={() => actions.stopTraining()}
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
                          const driversWithFastest = getDriverRanking(
                            settings.values.drivers,
                          );
                          const bestTime =
                            driversWithFastest[0]?.fastestLapTime;

                          return driversWithFastest.map(
                            ({ driver, fastestLap, fastestLapTime }, idx) => {
                              const pos = `${idx + 1}.`;
                              const name = `${driver.firstName} ${driver.lastName}`;
                              const kart = (driver as any).kart ?? "N/A";
                              const cones = fastestLap?.cones ?? 0;
                              const gates = fastestLap?.gates ?? 0;
                              const penalties =
                                fastestLap !== undefined
                                  ? `${cones}P ${gates}T (+${getLapPenaltySeconds(
                                      fastestLap,
                                      timePenalties,
                                    )}s)`
                                  : "N/A";
                              const timeStr = fastestLap
                                ? convertTimeToString(
                                    fastestLap.time_with_penalties,
                                  )
                                : "N/A";

                              const diffToBest =
                                fastestLapTime !== undefined
                                  ? idx === 0 || bestTime === undefined
                                    ? "-"
                                    : `+${convertTimeToString(
                                        fastestLapTime - bestTime,
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
                          onClick={() => actions.start()}
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
                          onClick={() => actions.lap()}
                        >
                          {isFinalLapInThisStint ? "Stop" : "Runde"}{" "}
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
                      onClick={() => actions.reset()}
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
                  {(() => {
                    const totalValidLapTime = getTotalLapTime(
                      currentStint.laps,
                    );
                    const averageValidLap = getAverageLap(currentStint.laps);

                    return (
                      <Text opacity={0.7}>
                        Gesamtzeit: {convertTimeToString(totalValidLapTime)}{" "}
                        &mdash; &#x00D8;{" "}
                        {averageValidLap === undefined
                          ? "N/A"
                          : convertTimeToString(averageValidLap)}
                      </Text>
                    );
                  })()}
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
                                    +{getLapPenaltySeconds(lap, timePenalties)}s
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
                                    actions.updateLapCones(index, val ?? 0)
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
                                    actions.updateLapGates(index, val ?? 0)
                                  }
                                />
                              </Table.Td>
                              <Table.Td>
                                <Checkbox
                                  onClick={() =>
                                    actions.toggleLapInvalid(index)
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

export default ActiveTrainingPage;
