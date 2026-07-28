import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import ScrollableTable from '@/components/shared/ScrollableTable';
import database from '@/lib/database';
import { Button, ButtonGroup, EmptyState, Group, Skeleton, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPencil, IconSearch, IconTrash } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/router';

const KartsPage = () => {
  const router = useRouter();
  const karts = useLiveQuery(() => database.karts.toArray())?.sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const tableActions = (uuid: Kart['uuid']) => {
    return (
      <ButtonGroup ms="auto" w="fit-content" key={uuid}>
        <Button onClick={() => router.push(`/karts/view/${uuid}`)}>
          <IconSearch />
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
          <Button onClick={() => router.push('/karts/create')} variant="filled" w="fit-content">
            Kart anlegen
          </Button>
        </Group>
        {karts === undefined ? (
          <Skeleton height={400} radius="sm" />
        ) : karts.length === 0 ? (
          <EmptyState
            icon={<IconSearch />}
            title="Keine Karts gefunden!"
            description="Wurden bereits Karts angelegt? Überprüfe die Filtereinstellungen oder lege ein neues Kart an."
            size="lg"
            withIndicatorBackground
          >
            <EmptyState.Actions>
              <Button onClick={() => router.push('/karts/create')} variant="filled">
                Kart anlegen
              </Button>
            </EmptyState.Actions>
          </EmptyState>
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
              caption: `${karts.length} ${karts.length === 1 ? 'Kart' : 'Karts'} wurden gefunden`,
            }}
          />
        )}
      </PageContent>
    </Layout>
  );
};
export default KartsPage;
