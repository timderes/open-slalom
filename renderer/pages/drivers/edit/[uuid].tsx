import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import { GENDER_OPTIONS, JKS_CLASSES, SKS_CLASSES } from '@/lib/constants';
import database from '@/lib/database';
import { getJksClass, getSksClass } from '@/lib/misc/getDriverClass';
import {
  Button,
  Group,
  NativeSelect,
  NumberInput,
  Stack,
  TextInput,
  Text,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const DriverEditPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  const form = useForm<Driver>({
    initialValues: {
      firstName: '',
      lastName: '',
      birthDate: '', // ISO string
      sex: 'male',
      driverClass: { jks: 0, sks: 1 },
      uuid: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  });

  const driver = useLiveQuery(() => database.drivers.get(uuid as string), [uuid]);

  useEffect(() => {
    if (!driver) return;
    form.setValues({
      firstName: driver.firstName,
      lastName: driver.lastName,
      birthDate: driver.birthDate,
      sex: driver.sex,
      driverClass: driver.driverClass,
      uuid: driver.uuid,
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
    });
    // Make
    form.resetDirty();
    form.resetTouched();
  }, [driver]);

  if (!uuid) {
    return (
      <Layout currentRoute="/drivers">
        <PageContent>
          <Title>Ungültige Fahrer-UUID</Title>
          <Text>Die eindeutige Kennung des Fahrers ist ungültig.</Text>
        </PageContent>
      </Layout>
    );
  }

  if (!driver) {
    return (
      <Layout currentRoute="/drivers">
        <PageContent>
          <Title>Fahrer nicht gefunden</Title>
          <Text>
            Der Fahrer mit der angegebenen UUID wurde in der Datenbank nicht gefunden. Ist die
            Datenbank aktuell?
          </Text>
        </PageContent>
      </Layout>
    );
  }

  const handleGoBack = () => {
    if (!form.isDirty()) {
      router.push('/drivers');
      return;
    }

    modals.openConfirmModal({
      title: 'Bearbeiten des Fahrers abbrechen?',
      centered: true,
      children: <Text>Bereits eingetragene Informationen werden nicht gespeichert!</Text>,
      labels: { confirm: 'Ja', cancel: 'Nein' },
      onConfirm: () => router.push('/drivers'),
    });
  };

  const handleBirthDateChange = (date: string) => {
    form.getInputProps('birthDate').onChange(date);

    const classJKS = getJksClass({ birthDate: date });
    const classSKS = getSksClass({ birthDate: date });

    form.setFieldValue('driverClass.jks', classJKS as Driver['driverClass']['jks']);
    form.setFieldValue('driverClass.sks', classSKS as Driver['driverClass']['sks']);
  };

  const handleEditDriver = () => {
    if (!form.isValid()) return;

    database.drivers
      .update(uuid as string, { ...form.values, updatedAt: Date.now() })
      .catch((error) => {
        notifications.show({
          title: 'Fehler beim Bearbeiten des Fahrers',
          message: `Es ist ein Fehler aufgetreten: ${error.message}`,
          color: 'red',
        });
      })
      .then(() => {
        notifications.show({
          title: 'Fahrer bearbeitet',
          message: 'Der Fahrer wurde erfolgreich bearbeitet.',
        });
        router.push('/drivers');
      });
  };

  return (
    <Layout currentRoute="/drivers">
      <PageContent>
        <PageHeader title="Fahrer bearbeiten" />
        <form
          onSubmit={form.onSubmit(
            () => handleEditDriver(),
            (errors) => {
              const getFirstErrorField = Object.keys(errors)[0];
              form.getInputProps(getFirstErrorField).onFocus();
            },
          )}
        >
          <Stack>
            <Group grow>
              <TextInput
                label="Vorname"
                placeholder="Max"
                {...form.getInputProps('firstName')}
                key={form.key('firstName')}
              />
              <TextInput
                label="Nachname"
                placeholder="Verstappen"
                {...form.getInputProps('lastName')}
                key={form.key('lastName')}
              />
            </Group>
            <Group grow>
              <DateInput
                valueFormat="DD. MMMM YYYY"
                value={form.values.birthDate ? new Date(form.values.birthDate) : null}
                onChange={(e) => handleBirthDateChange(e)}
                label="Geburtsdatum"
                placeholder="Geburtsdatum"
                key={form.key('birthDate')}
                error={form.getInputProps('birthDate').error}
              />
              <NativeSelect
                label="Geschlecht"
                data={GENDER_OPTIONS}
                key={form.key('sex')}
                {...form.getInputProps('sex')}
              />
            </Group>
            <Group grow>
              <NumberInput
                description="Die JKS-Klasse wird automatisch basierend auf dem Geburtsdatum berechnet. Kann allerdings manuell angepasst werden."
                min={Math.min(...JKS_CLASSES)}
                max={Math.max(...JKS_CLASSES)}
                label="Klasse JKS"
                {...form.getInputProps('driverClass.jks')}
                key={form.key('driverClass.jks')}
              />
              <NumberInput
                description="Die SKS-Klasse wird automatisch basierend auf dem Geburtsdatum berechnet. Kann allerdings manuell angepasst werden."
                min={Math.min(...SKS_CLASSES)}
                max={Math.max(...SKS_CLASSES)}
                label="Klasse SKS"
                {...form.getInputProps('driverClass.sks')}
                key={form.key('driverClass.sks')}
              />
            </Group>
            <Group mt="xl">
              <Button type="submit">Änderungen speichern</Button>
              <Button ms="auto" variant="subtle" onClick={() => handleGoBack()}>
                Zurück
              </Button>
            </Group>
          </Stack>
        </form>
      </PageContent>
    </Layout>
  );
};

export default DriverEditPage;
