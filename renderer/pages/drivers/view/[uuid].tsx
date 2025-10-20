import Layout from "@/components/shared/Layout";
import PageHeader from "@/components/shared/PageHeader";
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

const DriverViewPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  const driver = useLiveQuery(() => database.drivers.get(uuid.toString()));
  const trainings = useLiveQuery(() =>
    database.trainings
      .filter((training) =>
        training.drivers.some((driver) => driver.uuid === uuid.toString())
      )
      .toArray()
  );

  if (!driver) {
    return (
      <Layout currentRoute="/drivers">
        <Container my="sm">
          <PageHeader title="Fahrer nicht gefunden" />
          <Text>
            Die Daten für den Fahrer mit der UUID {uuid} konnten nicht geladen
            werden.
          </Text>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout currentRoute="/drivers">
      <Container my="sm">
        <Stack>
          <Group align="center">
            <PageHeader title={driver.firstName + " " + driver.lastName} />
            <Tooltip label={`UUID: ${driver.uuid}`} withArrow position="bottom">
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
              <Stack ta="center" gap={0}>
                <Text fw="bold">
                  {new Date(driver.birthDate).toLocaleDateString(
                    "de",
                    DEFAULT_DATE_FORMAT
                  )}
                </Text>
                <Text opacity={0.7}>Geburtstag</Text>
              </Stack>
              <Stack ta="center" gap={0}>
                <Text fw="bold">{translateSex(driver.sex)}</Text>
                <Text opacity={0.7}>Geschlecht</Text>
              </Stack>
              <Stack ta="center" gap={0}>
                <Text fw="bold">K{driver.driverClass.jks}</Text>
                <Text opacity={0.7}>JKS</Text>
              </Stack>
              <Stack ta="center" gap={0}>
                <Text fw="bold">K{driver.driverClass.sks}</Text>
                <Text opacity={0.7}>SKS</Text>
              </Stack>
              <Stack ta="center" gap={0}>
                <Text fw="bold">{trainings?.length || 0}</Text>
                <Text opacity={0.7}>Trainings</Text>
              </Stack>
            </Group>
          </Card>
          <Divider label="Trainings" labelPosition="left" />
          {trainings && trainings.length > 0 && (
            <Table mt="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Datum</Table.Th>
                  <Table.Th>Modus</Table.Th>
                  <Table.Th>{/* Actions */}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {trainings.map((training) => (
                  <Table.Tr key={training.uuid}>
                    <Table.Td>
                      {new Date(training.createdAt).toLocaleDateString(
                        "de",
                        DEFAULT_DATE_FORMAT
                      )}
                    </Table.Td>
                    <Table.Td>{training.mode}</Table.Td>
                    <Table.Td>
                      <Button size="xs" disabled>
                        <IconSearch />
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
          {!trainings || trainings.length === 0 ? (
            <Text>
              {driver.firstName} hat noch an keinem Training teilgenommen.
            </Text>
          ) : null}
        </Stack>
      </Container>
    </Layout>
  );
};

export default DriverViewPage;
