import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import Stat from '@/components/shared/Stat';
import database from '@/lib/database';
import { ActionIcon, Button, Card, EmptyState, Group, Skeleton, Tooltip } from '@mantine/core';
import { IconCode, IconPencil, IconZoomQuestion } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/router';

const KartViewPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  const kart = useLiveQuery(() => database.karts.get(uuid?.toString() ?? ''), [uuid], undefined);
  const drivers = useLiveQuery(() => database.drivers.toArray(), [], undefined);

  if (kart === undefined || drivers === undefined) {
    return (
      <Layout currentRoute="/karts">
        <PageContent>
          <Skeleton height={32} radius="sm" />
          <Skeleton height={120} mt={8} radius="sm" />
        </PageContent>
      </Layout>
    );
  }

  if (!kart) {
    return (
      <Layout currentRoute="/karts">
        <EmptyState
          icon={<IconZoomQuestion />}
          title="Dieses Kart konnte nicht gefunden werden!"
          description={`Möglicherweise wurde es gelöscht oder die UUID ist ungültig. (UUID: ${uuid})`}
          size="lg"
          withIndicatorBackground
        >
          <EmptyState.Actions>
            <Button onClick={() => router.push('/karts')} variant="filled">
              Zurück zu den Karts
            </Button>
          </EmptyState.Actions>
        </EmptyState>
      </Layout>
    );
  }

  return (
    <Layout currentRoute="/karts">
      <PageContent>
        <Group align="center">
          <PageHeader title={kart.name} />
          <Tooltip label="Kart bearbeiten" withArrow>
            <ActionIcon ms="auto" onClick={() => router.push(`/karts/edit/${kart.uuid}`)}>
              <IconPencil />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={`UUID: ${kart.uuid}`} withArrow>
            <ActionIcon color="gray" variant="transparent">
              <IconCode />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Card withBorder mt="md">
          <Group grow>
            <Stat label="Chassis" value={kart.chassis} />
            <Stat label="Motor" value={kart.engine} />
            <Stat label="Typ" value={kart.type} />
          </Group>
        </Card>
      </PageContent>
    </Layout>
  );
};

export default KartViewPage;
