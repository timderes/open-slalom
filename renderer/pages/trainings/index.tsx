import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import ScrollableTable from '@/components/shared/ScrollableTable';
import { APP_LANGUAGE, DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT } from '@/lib/constants';
import database from '@/lib/database';
import {
  Avatar,
  AvatarGroup,
  Button,
  ButtonGroup,
  EmptyState,
  Grid,
  Group,
  MultiSelect,
  Skeleton,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPencil, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/router';
import { useState } from 'react';
import log from 'electron-log/renderer';

const TrainingsIndexPage = () => {
  const [modes, setModes] = useState<string[]>(['JKS', 'SKS']);
  const router = useRouter();
  const trainings = useLiveQuery(() => database.trainings.toArray(), [modes])
    ?.sort((a, b) => b.createdAt - a.createdAt)
    .filter((t) => modes.includes(t.mode));

  const TableActions = ({ uuid }: { uuid: Training['uuid'] }) => {
    return (
      <ButtonGroup ms="auto" w="fit-content" key={uuid}>
        <Button onClick={() => router.push(`/trainings/${uuid}/view`)}>
          <IconSearch />
        </Button>
        <Button
          disabled
          //onClick={() => router.push(`/drivers/edit/${uuid}`)}
        >
          <IconPencil />
        </Button>
        <Button variant="filled" bg="red" onClick={() => handleDeleteTraining(uuid)}>
          <IconTrash />
        </Button>
      </ButtonGroup>
    );
  };

  const handleDeleteTraining = (uuid: Training['uuid']) => {
    const training = trainings?.find((t) => t.uuid === uuid);

    if (!training) {
      notifications.show({
        title: 'Training nicht gefunden',
        message: `Das Training mit der UUID ${uuid} konnte nicht gefunden werden. Wurde es möglicherweise bereits gelöscht?`,
        color: 'red',
      });

      return;
    }

    modals.openConfirmModal({
      title: `Training löschen?`,
      children: (
        <Text>
          Das {training.mode}-Training vom {new Date(training.createdAt).toLocaleDateString()} wird
          gelöscht. Das kann nicht rückgängig gemacht werden!
        </Text>
      ),
      onConfirm: () =>
        database.trainings
          .delete(training.uuid)
          .catch((error) => {
            log.error(`Error occurred while deleting training with UUID ${training.uuid}:`, error);
          })
          .then(() => {
            log.info(`The training with UUID ${training.uuid}  was deleted successfully.`);
          }),
      labels: { confirm: 'Löschen', cancel: 'Abbrechen' },
      confirmProps: { color: 'red' },
      centered: true,
    });
  };

  return (
    <Layout currentRoute="/trainings">
      <PageContent fluid>
        <Grid>
          <Grid.Col span={12}>
            <Group justify="space-between">
              <PageHeader title="Trainings" />
              <Button onClick={() => router.push('/trainings/active')} leftSection={<IconPlus />}>
                Neues Training
              </Button>
            </Group>
          </Grid.Col>
          <Grid.Col span={2}>
            <Title order={2}>Filter</Title>

            <MultiSelect
              data={['JKS', 'SKS']}
              defaultValue={['JKS', 'SKS']}
              label="Trainingsmodus"
              onChange={(modes) => setModes(modes)}
            />
          </Grid.Col>
          <Grid.Col span={9}>
            {trainings === undefined ? (
              <Skeleton height={400} radius="sm" />
            ) : trainings.length === 0 ? (
              <EmptyState
                icon={<IconSearch />}
                title="Keine Trainings gefunden!"
                description="Wurden bereits Trainings abgeschlossen? Überprüfe die Filtereinstellungen oder starte ein neues Training an."
                size="lg"
                withIndicatorBackground
              >
                <EmptyState.Actions>
                  <Button onClick={() => router.push('/trainings/active')} variant="filled">
                    Neues Training starten
                  </Button>
                </EmptyState.Actions>
              </EmptyState>
            ) : (
              <ScrollableTable
                striped
                highlightOnHover
                withRowBorders={false}
                data={{
                  head: ['Datum', 'Modus', 'Fahrer', ''], // the "" is needed for the actions column
                  body: trainings?.map((training) => [
                    new Date(training.createdAt).toLocaleDateString(APP_LANGUAGE, {
                      ...DEFAULT_DATE_FORMAT,
                      ...DEFAULT_TIME_FORMAT,
                      // This removes the seconds from the time format,
                      // as they are not needed in the table view
                      second: undefined,
                    }),
                    training.mode,
                    <AvatarGroup>
                      {(training.drivers ?? []).slice(0, 7).map((driver) => (
                        <Tooltip
                          key={driver.uuid}
                          label={`${driver.firstName} ${driver.lastName}`}
                          withArrow
                        >
                          <Avatar
                            name={`${driver.firstName} ${driver.lastName}`}
                            color="initials"
                          />
                        </Tooltip>
                      ))}
                      {(training.drivers?.length ?? 0) > 7 && (
                        <Tooltip
                          label={`${(training.drivers?.length ?? 0) - 7} weitere Fahrer`}
                          withArrow
                        >
                          <Avatar>+{(training.drivers?.length ?? 0) - 7}</Avatar>
                        </Tooltip>
                      )}
                    </AvatarGroup>,
                    <TableActions uuid={training.uuid} />,
                  ]),
                  caption: `${trainings.length} ${trainings.length === 1 ? 'Training' : 'Trainings'} wurden gefunden`,
                }}
              />
            )}{' '}
          </Grid.Col>{' '}
        </Grid>
      </PageContent>
    </Layout>
  );
};

export default TrainingsIndexPage;
