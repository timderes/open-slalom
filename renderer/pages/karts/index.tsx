import EmptyQueryResult from '@/components/shared/EmptyQueryResult';
import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import ScrollableTable from '@/components/shared/ScrollableTable';
import database from '@/lib/database';
import { Button, ButtonGroup, Group, Skeleton, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPencil, IconTrash, IconUserSearch } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/router';

const KartsPage = () => {
  const router = useRouter();
  const karts = useLiveQuery(() => database.karts.toArray(), undefined);

  const tableActions = (uuid: Kart['uuid']) => {
    return (
      <ButtonGroup ms="auto" w="fit-content" key={uuid}>
        <Button onClick={() => router.push(`/karts/view/${uuid}`)}>
          <IconUserSearch />
        </Button>
        <Button onClick={() => router.push(`/karts/edit/${uuid}`)}>
          <IconPencil />
        </Button>
        <Button variant="filled" bg="red" onClick={() => handleDeleteKart(uuid)}>
          <IconTrash />
        </Button>
      </ButtonGroup>
    );
  };

  const handleDeleteKart = (uuid: Kart['uuid']) => {
    modals.openConfirmModal({
      title: `Das Kart wirklich löschen?`,
      children: (
        <Text>Alle Daten von Kart werden gelöscht. Das kann nicht rückgängig gemacht werden!</Text>
      ),
      onConfirm: () => database.karts.delete(uuid),
      labels: { confirm: 'Löschen', cancel: 'Abbrechen' },
      centered: true,
    });
  };

  return (
    <Layout currentRoute="/karts">
      <PageContent>
        <Group justify="space-between">
          <PageHeader title="Karts" />
          <Button
            // leftSection={<Icon />}
            onClick={() => router.push('/karts/create')}
            variant="filled"
            w="fit-content"
          >
            Kart anlegen
          </Button>
        </Group>
        {karts === undefined ? (
          <Skeleton height={400} radius="sm" />
        ) : karts.length === 0 ? (
          <EmptyQueryResult title="Wo sind die Karts?">
            Es wurden keine Karts gefunden.
            <Button
              onClick={() => router.push('/karts/create')}
              variant="filled"
              w="fit-content"
              display="block"
              mx="auto"
              mt="xl"
              size="md"
            >
              Kart anlegen
            </Button>
          </EmptyQueryResult>
        ) : (
          <ScrollableTable
            striped
            highlightOnHover
            withRowBorders={false}
            data={{
              head: ['Kart', 'Typ', 'Chassis', 'Motor', ''],
              body: karts
                ? karts.map((kart) => [
                    `${kart.name}`,
                    kart.type,
                    kart.chassis,
                    kart.engine,
                    tableActions(kart.uuid),
                  ])
                : [],
              caption: `${karts?.length ?? 0} Karts wurden gefunden`,
            }}
          />
        )}
      </PageContent>
    </Layout>
  );
};
export default KartsPage;
