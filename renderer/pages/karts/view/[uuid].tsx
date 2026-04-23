import EmptyQueryResult from "@/components/shared/EmptyQueryResult";
import Layout from "@/components/shared/Layout";
import PageContent from "@/components/shared/PageContent";
import PageHeader from "@/components/shared/PageHeader";
import Stat from "@/components/shared/Stat";
import database from "@/lib/database";
import { ActionIcon, Card, Group, Tooltip } from "@mantine/core";
import { IconCode } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/router";

const KartViewPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  const kart = useLiveQuery(() => database.karts.get(uuid.toString()));

  if (!kart) {
    return (
      <Layout currentRoute="/karts">
        <EmptyQueryResult title="Kart nicht gefunden">
          Die Daten für das Kart mit der UUID {uuid} konnten nicht geladen
          werden.
        </EmptyQueryResult>
      </Layout>
    );
  }

  return (
    <Layout currentRoute="/karts">
      <PageContent>
        <Group align="center">
          <PageHeader title={kart.name} />
          <Tooltip label={`UUID: ${kart.uuid}`} withArrow position="bottom">
            <ActionIcon
              c="gray"
              variant="transparent"
              ms="auto"
              w="fit-content"
            >
              <IconCode />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Card withBorder>
          <Group flex={{ xs: "flex-row" }} grow>
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
