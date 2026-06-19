import { useMemo } from 'react';
import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import Stat from '@/components/shared/Stat';
import database from '@/lib/database';
import { formatTime } from '@/lib/time/formatTime';

import { Divider, Grid, Skeleton, Table } from '@mantine/core';
import { useLiveQuery } from 'dexie-react-hooks';

// TODO: Messy route... We need to refactor it later
// TODO: Add JKS/SKS filtering and date range filtering
const StatisticsPage = () => {
  const drivers = useLiveQuery(() => database.drivers.toArray(), []);
  const karts = useLiveQuery(() => database.karts.toArray(), []);
  const trainings = useLiveQuery(() => database.trainings.toArray(), []);

  const stats = useMemo(() => {
    if (!trainings) return undefined;

    let laps = 0;
    let stints = 0;

    let cones = 0;
    let gates = 0;

    let validLaps = 0;
    let invalidLaps = 0;
    let cleanLaps = 0;

    let fastestLap = Infinity;

    let totalTrainingDuration = 0;
    let totalDriversInTrainings = 0;

    type DriverAgg = {
      uuid: string;
      name: string;
      laps: number;
      stints: number;
      cones: number;
      gates: number;
      drivingTime: number; // derived from laps
      trainings: number;
      cleanLaps: number;
    };

    const driverMap = new Map<string, DriverAgg>();

    for (const training of trainings) {
      totalTrainingDuration += Number(training.updatedAt ?? 0) - Number(training.createdAt ?? 0);

      totalDriversInTrainings += training.drivers?.length ?? 0;

      for (const driver of training.drivers ?? []) {
        const uuid = driver.uuid;
        const name = `${driver.firstName} ${driver.lastName}`;

        if (!driverMap.has(uuid)) {
          driverMap.set(uuid, {
            uuid,
            name,
            laps: 0,
            stints: 0,
            cones: 0,
            gates: 0,
            drivingTime: 0,
            trainings: 0,
            cleanLaps: 0,
          });
        }

        const d = driverMap.get(uuid)!;
        d.trainings++;

        for (const stint of driver.stints ?? []) {
          stints++;
          d.stints++;

          for (const lap of stint.laps ?? []) {
            laps++;
            d.laps++;

            const coneCount = Number(lap.cones ?? 0);
            const gateCount = Number(lap.gates ?? 0);

            cones += coneCount;
            gates += gateCount;

            d.cones += coneCount;
            d.gates += gateCount;

            // 👉 DRIVING TIME FIX (correct source)
            const lapTime = Number(lap.time ?? 0);
            d.drivingTime += lapTime;

            if (lap.isInvalid) {
              invalidLaps++;
              continue;
            }

            validLaps++;

            if (coneCount === 0 && gateCount === 0) {
              cleanLaps++;
              d.cleanLaps++;
            }

            if (lapTime > 0 && lapTime < fastestLap) {
              fastestLap = lap.time_with_penalties;
            }
          }
        }
      }
    }

    const driverRanking = Array.from(driverMap.values())
      .sort((a, b) => b.drivingTime - a.drivingTime)
      .map((d, index) => ({
        rank: index + 1,
        ...d,
      }));

    return {
      total: {
        drivers: drivers?.length ?? 0,
        karts: karts?.length ?? 0,
        trainings: trainings.length,

        laps,
        stints,

        cones,
        gates,

        drivingTime: driverRanking.reduce((sum, d) => sum + d.drivingTime, 0),
      },

      average: {
        trainingDuration: trainings.length > 0 ? totalTrainingDuration / trainings.length : 0,

        driversPerTraining: trainings.length > 0 ? totalDriversInTrainings / trainings.length : 0,

        conesPerLap: laps ? cones / laps : 0,
        gatesPerLap: laps ? gates / laps : 0,

        conesPerStint: stints ? cones / stints : 0,
        gatesPerStint: stints ? gates / stints : 0,

        drivingTimePerLap: laps
          ? driverMap.size
            ? driverRanking.reduce((sum, d) => sum + d.drivingTime, 0) / laps
            : 0
          : 0,
      },

      quality: {
        cleanLapRate: validLaps ? cleanLaps / validLaps : 0,
        invalidLapRate: laps ? invalidLaps / laps : 0,
      },

      driverRanking,
    };
  }, [trainings, drivers, karts]);

  if (
    drivers === undefined ||
    karts === undefined ||
    trainings === undefined ||
    stats === undefined
  ) {
    return (
      <Layout currentRoute="/statistics">
        <PageContent fluid>
          <PageHeader title="Statistiken (Alle Trainings - JKS & SKS)" />
          <Grid>
            <Grid.Col span={4}>
              <Skeleton height={100} />
            </Grid.Col>
            <Grid.Col span={4}>
              <Skeleton height={100} />
            </Grid.Col>{' '}
            <Grid.Col span={4}>
              <Skeleton height={100} />
            </Grid.Col>
            <Grid.Col span={4}>
              <Skeleton height={100} />
            </Grid.Col>
            <Grid.Col span={4}>
              <Skeleton height={100} />
            </Grid.Col>
            <Grid.Col span={4}>
              <Skeleton height={100} />
            </Grid.Col>
          </Grid>
          <Skeleton height={700} />
        </PageContent>
      </Layout>
    );
  }

  return (
    <Layout currentRoute="/statistics">
      <PageContent fluid>
        <PageHeader title="Statistiken (Alle Trainings - JKS & SKS)" />

        <Grid>
          <Grid.Col span={4}>
            <Stat value={stats.total.drivers} label="Fahrer" />
          </Grid.Col>

          <Grid.Col span={4}>
            <Stat value={stats.total.karts} label="Karts" />
          </Grid.Col>

          <Grid.Col span={4}>
            <Stat value={stats.total.trainings} label="Trainings" />
          </Grid.Col>

          <Grid.Col span={4}>
            <Stat value={stats.total.laps} label="Runden" />
          </Grid.Col>

          <Grid.Col span={4}>
            <Stat value={stats.total.stints} label="Stints" />
          </Grid.Col>

          <Grid.Col span={4}>
            <Stat
              value={formatTime(stats.total.drivingTime, 'duration')}
              label="Gesamte Fahrzeit"
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <Stat value={stats.total.cones} label="Pylonen" />
          </Grid.Col>

          <Grid.Col span={4}>
            <Stat value={stats.total.gates} label="Torfehler" />
          </Grid.Col>

          <Grid.Col span={4}>
            <Stat
              value={stats.average.conesPerLap.toFixed(2).replace('.', ',')}
              label="Ø Pylonen / Runde"
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <Stat
              value={stats.average.gatesPerLap.toFixed(2).replace('.', ',')}
              label="Ø Torfehler / Runde"
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <Stat
              value={`${(stats.quality.cleanLapRate * 100).toFixed(1).replace('.', ',')}%`}
              label="Fehlerfreie Runden"
            />
          </Grid.Col>
        </Grid>
        <Divider label="Fahrer-Übersicht" />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Fahrer</Table.Th>
              <Table.Th>Fahrzeit</Table.Th>
              <Table.Th>Trainings</Table.Th>
              <Table.Th>Runden</Table.Th>
              <Table.Th>Fehlerfreie Runden</Table.Th>
              <Table.Th>Stints</Table.Th>
              <Table.Th>Pylonen</Table.Th>
              <Table.Th>Torfehler</Table.Th>
              <Table.Th>Pylonen / Runde</Table.Th>
              <Table.Th>Torfehler / Runde</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {stats.driverRanking.map((d) => (
              <Table.Tr key={d.uuid}>
                <Table.Td>{d.name}</Table.Td>
                <Table.Td>{formatTime(d.drivingTime, 'duration')}</Table.Td>
                <Table.Td>{d.trainings}</Table.Td>
                <Table.Td>{d.laps}</Table.Td>
                <Table.Td>
                  {d.cleanLaps} ({((d.cleanLaps / d.laps) * 100).toFixed(1).replace('.', ',')}%)
                </Table.Td>
                <Table.Td>{d.stints}</Table.Td>
                <Table.Td>{d.cones}</Table.Td>
                <Table.Td>{d.gates}</Table.Td>
                <Table.Td>{(d.cones / d.laps).toFixed(2).replace('.', ',')}</Table.Td>
                <Table.Td>{(d.gates / d.laps).toFixed(2).replace('.', ',')}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </PageContent>
    </Layout>
  );
};

export default StatisticsPage;
