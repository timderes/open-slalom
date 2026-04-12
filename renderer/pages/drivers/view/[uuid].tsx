import EmptyQueryResult from "@/components/shared/EmptyQueryResult";
import Layout from "@/components/shared/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Stat from "@/components/shared/Stat";
import { DEFAULT_DATE_FORMAT } from "@/lib/constants";
import database from "@/lib/database";
import translateSex from "@/lib/misc/translateSex";
import {
  ActionIcon,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Stack,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCode, IconPencil, IconSearch } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/router";

const DriverViewPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  const driver = useLiveQuery(() => database.drivers.get(uuid.toString()));
  const trainings = useLiveQuery(() =>
    database.trainings
      .filter((training) =>
        training.drivers.some((driver) => driver.uuid === uuid.toString()),
      )
      .toArray(),
  );

  if (!driver) {
    return (
      <Layout currentRoute="/drivers">
        <EmptyQueryResult title="Fahrer nicht gefunden">
          Die Daten für den Fahrer mit der UUID <code>{uuid}</code> konnten
          nicht geladen werden.
        </EmptyQueryResult>
      </Layout>
    );
  }

  return (
    <Layout currentRoute="/drivers">
      <Container my="sm">
        <Stack>
          <Group align="center">
            <PageHeader title={driver.firstName + " " + driver.lastName} />
            <Tooltip
              label={`Das Profil von ${driver.firstName} bearbeiten`}
              withArrow
              position="bottom"
            >
              <ActionIcon
                ms="auto"
                w="fit-content"
                onClick={() => router.push(`/drivers/edit/${uuid}`)}
              >
                <IconPencil />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={`UUID: ${driver.uuid}`} withArrow position="bottom">
              <ActionIcon c="gray" variant="transparent" w="fit-content">
                <IconCode />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Card withBorder>
            <Group flex={{ xs: "flex-row" }} grow>
              <Stat
                label="Geburtstag"
                value={new Date(driver.birthDate).toLocaleDateString(
                  "de",
                  DEFAULT_DATE_FORMAT,
                )}
              />
              <Stat label="Geschlecht" value={translateSex(driver.sex)} />
              <Stat label="JKS" value={`K${driver.driverClass.jks}`} />
              <Stat label="SKS" value={`K${driver.driverClass.sks}`} />
              <Stat label="Trainings" value={trainings?.length || 0} />
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
                        DEFAULT_DATE_FORMAT,
                      )}
                    </Table.Td>
                    <Table.Td>{training.mode}</Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        onClick={() =>
                          router.push(`/training/${training.uuid}/view`)
                        }
                      >
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
