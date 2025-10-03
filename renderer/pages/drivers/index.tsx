import Layout from "@/components/shared/Layout";
import { DEFAULT_DATE_FORMAT } from "@/lib/constants";
import database from "@/lib/database";
import calculateDriverAge from "@/lib/misc/calculateDriverAge";
import {
  getJksDriverClass,
  getSksDriverClass,
} from "@/lib/misc/getDriverClass";
import {
  Button,
  ButtonGroup,
  Container,
  Group,
  Table,
  Text,
} from "@mantine/core";
import { IconPencil, IconTrash, IconUserSearch } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/router";
import { modals } from "@mantine/modals";
import PageHeader from "@/components/shared/PageHeader";

const DriversPage = () => {
  const router = useRouter();
  const drivers = useLiveQuery(() => database.drivers.toArray());

  const rows = drivers?.map((driver) => (
    <Table.Tr key={driver.uuid}>
      <Table.Td>
        {driver.firstName} {driver.lastName}
      </Table.Td>
      <Table.Td>
        {new Date(driver.birthDate).toLocaleDateString("de", {
          ...DEFAULT_DATE_FORMAT,
          month: "long",
        })}{" "}
        ({calculateDriverAge(driver.birthDate)} Jahre)
      </Table.Td>
      <Table.Td>K{getJksDriverClass({ birthDate: driver.birthDate })}</Table.Td>
      <Table.Td>K{getSksDriverClass({ birthDate: driver.birthDate })}</Table.Td>
      <Table.Td>
        <ButtonGroup>
          <Button onClick={() => router.push(`/drivers/view/${driver.uuid}`)}>
            <IconUserSearch />
          </Button>
          <Button disabled>
            <IconPencil />
          </Button>
          <Button
            variant="filled"
            bg="red"
            onClick={() => handleDeleteDriver(driver)}
          >
            <IconTrash />
          </Button>
        </ButtonGroup>
      </Table.Td>
    </Table.Tr>
  ));

  const handleDeleteDriver = (driver: Driver) => {
    modals.openConfirmModal({
      title: `Das Profil von ${driver.firstName} löschen?`,
      children: (
        <Text>
          Alle Ergebnisse und Daten von {driver.firstName} werden gelöscht. Das
          kann nicht rückgänig gemacht werden!
        </Text>
      ),
      onConfirm: () => database.drivers.delete(driver.uuid),
      labels: { confirm: "Löschen", cancel: "Abbrechen" },
      centered: true,
    });
  };

  return (
    <Layout currentRoute="/drivers">
      <Container my="sm">
        <PageHeader title="Fahrer" />
        <Group>
          <Button
            onClick={() => router.push("/drivers/create")}
            variant="filled"
            w="fit-content"
          >
            Fahrer anlegen
          </Button>
        </Group>
        {!drivers || drivers.length === 0 ? (
          <p>Es sind noch keine Fahrer angelegt.</p>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Geburtsdatum</Table.Th>
                <Table.Th>JKS</Table.Th>
                <Table.Th>SKS</Table.Th>
                <Table.Th>{/* Actions */}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        )}
      </Container>
    </Layout>
  );
};

export default DriversPage;
