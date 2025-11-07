import Layout from "@/components/shared/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Stat from "@/components/shared/Stat";
import { DEFAULT_DATE_FORMAT } from "@/lib/constants";
import database from "@/lib/database";
import translateSex from "@/lib/misc/translateSex";
import {
  ActionIcon,
  Button,
  ButtonGroup,
  Card,
  Container,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCode, IconSearch } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/router";

const KartViewPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  const kart = useLiveQuery(() => database.karts.get(uuid.toString()));

  if (!kart) {
    return (
      <Layout currentRoute="/karts">
        <Container my="sm">
          <PageHeader title="Kart nicht gefunden" />
          <Text>
            Die Daten für das Kart mit der UUID {uuid} konnten nicht geladen
            werden.
          </Text>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout currentRoute="/karts">
      <Container my="sm">
        <Stack>
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
        </Stack>
      </Container>
    </Layout>
  );
};

export default KartViewPage;
