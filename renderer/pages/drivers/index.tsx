import Layout from '@/components/shared/Layout';
import { APP_LANGUAGE, DEFAULT_DATE_FORMAT, DEFAULT_TOOLTIP_PROPS } from '@/lib/constants';
import database from '@/lib/database';
import calculateDriverAge from '@/lib/misc/calculateDriverAge';
import { getJksClass, getSksClass } from '@/lib/misc/getDriverClass';
import { Avatar, Button, ButtonGroup, Group, Skeleton, Text, Tooltip } from '@mantine/core';
import {
  IconGenderFemale,
  IconGenderMale,
  IconGenderTransgender,
  IconHelmet,
  IconPencil,
  IconTrash,
  IconUserSearch,
} from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/router';
import { modals } from '@mantine/modals';
import PageHeader from '@/components/shared/PageHeader';
import ScrollableTable from '@/components/shared/ScrollableTable';
import PageContent from '@/components/shared/PageContent';
import EmptyQueryResult from '@/components/shared/EmptyQueryResult';

const DriversPage = () => {
  const router = useRouter();
  const drivers = useLiveQuery(() => database.drivers.toArray(), undefined)?.sort((a, b) => {
    // Sort by last name, then first name
    if (a.lastName.toLowerCase() < b.lastName.toLowerCase()) return -1;
    if (a.lastName.toLowerCase() > b.lastName.toLowerCase()) return 1;
    if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) return -1;
    if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) return 1;
    return 0;
  });

  const tableActions = (uuid: Driver['uuid']) => {
    return (
      <ButtonGroup ms="auto" w="fit-content" key={uuid}>
        <Button onClick={() => router.push(`/drivers/view/${uuid}`)}>
          <IconUserSearch />
        </Button>
        <Button onClick={() => router.push(`/drivers/edit/${uuid}`)}>
          <IconPencil />
        </Button>
        <Button variant="filled" bg="red" onClick={() => handleDeleteDriver(uuid)}>
          <IconTrash />
        </Button>
      </ButtonGroup>
    );
  };

  const handleDeleteDriver = (uuid: Driver['uuid']) => {
    const driver = drivers.find((d) => d.uuid === uuid);
    if (!driver) return;

    modals.openConfirmModal({
      title: `Das Profil von ${driver.firstName} löschen?`,
      children: (
        <Text>
          Alle Ergebnisse und Daten von {driver.firstName} werden gelöscht. Das kann nicht
          rückgängig gemacht werden!
        </Text>
      ),
      onConfirm: () => database.drivers.delete(driver.uuid),
      labels: { confirm: 'Löschen', cancel: 'Abbrechen' },
      confirmProps: { color: 'red' },
      centered: true,
    });
  };

  return (
    <Layout currentRoute="/drivers">
      <PageContent>
        <Group justify="space-between">
          <PageHeader title="Fahrer" />
          <Button
            leftSection={<IconHelmet />}
            onClick={() => router.push('/drivers/create')}
            variant="filled"
            w="fit-content"
          >
            Fahrer anlegen
          </Button>
        </Group>
        {drivers === undefined ? (
          <Skeleton height={400} radius="sm" />
        ) : drivers.length === 0 ? (
          <EmptyQueryResult title="Leeres Starterfeld">
            Es wurden keine Fahrer gefunden.
            <Button
              leftSection={<IconHelmet />}
              onClick={() => router.push('/drivers/create')}
              variant="filled"
              w="fit-content"
              display="block"
              mx="auto"
              mt="xl"
              size="md"
            >
              Fahrer anlegen
            </Button>
          </EmptyQueryResult>
        ) : (
          <ScrollableTable
            striped
            highlightOnHover
            withRowBorders={false}
            data={{
              head: ['Name', '', 'Geburtsdatum', 'JKS', 'SKS'],
              body: drivers
                ? drivers.map((driver) => {
                    const jksClass = getJksClass({ birthDate: driver.birthDate });
                    const sksClass = getSksClass({ birthDate: driver.birthDate });
                    const jksDisplay = jksClass === '-' ? '-' : `K${jksClass}`;
                    const sksDisplay = sksClass === '-' ? '-' : `K${sksClass}`;

                    return [
                      <Group gap="md">
                        <Avatar color="initials" name={`${driver.firstName} ${driver.lastName}`} />
                        <Text>
                          {driver.firstName} {driver.lastName}
                        </Text>
                      </Group>,
                      driver.gender === 'male' ? (
                        <Tooltip label="Männlich" {...DEFAULT_TOOLTIP_PROPS}>
                          <IconGenderMale />
                        </Tooltip>
                      ) : driver.gender === 'female' ? (
                        <Tooltip label="Weiblich" {...DEFAULT_TOOLTIP_PROPS}>
                          <IconGenderFemale />
                        </Tooltip>
                      ) : (
                        <Tooltip label="Divers" {...DEFAULT_TOOLTIP_PROPS}>
                          <IconGenderTransgender />
                        </Tooltip>
                      ),
                      `${new Date(driver.birthDate).toLocaleDateString(APP_LANGUAGE, {
                        ...DEFAULT_DATE_FORMAT,
                        month: 'long',
                      })} (${calculateDriverAge(driver.birthDate)} Jahre)`,
                      jksDisplay,
                      sksDisplay,
                      tableActions(driver.uuid),
                    ];
                  })
                : [],
              caption: `${drivers.length} Fahrer wurden gefunden`,
            }}
          />
        )}
      </PageContent>
    </Layout>
  );
};

export default DriversPage;
