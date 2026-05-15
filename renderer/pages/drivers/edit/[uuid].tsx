import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import Stat from '@/components/shared/Stat';
import { GENDER_OPTIONS } from '@/lib/constants';
import database from '@/lib/database';
import { getJksClass, getSksClass } from '@/lib/misc/getDriverClass';
import { Button, Group, NativeSelect, Stack, TextInput, Text, Title, Card } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const DriverEditPage = () => {
  const [driverClasses, setDriverClasses] = useState<{
    jks: string | number;
    sks: string | number;
  }>({
    jks: '-',
    sks: '-',
  });

  const router = useRouter();
  const { uuid } = router.query;

  const form = useForm<Driver>({
    initialValues: {
      firstName: '',
      lastName: '',
      birthDate: '', // ISO string
      sex: 'male',
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
      uuid: driver.uuid,
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
    });

    const classJKS = getJksClass({ birthDate: driver.birthDate });
    const classSKS = getSksClass({ birthDate: driver.birthDate });

    setDriverClasses({
      jks: classJKS,
      sks: classSKS,
    });

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

    setDriverClasses({
      jks: classJKS,
      sks: classSKS,
    });
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
              <Card>
                <Stat
                  label="JKS"
                  value={driverClasses.jks === '-' ? '-' : `K${driverClasses.jks}`}
                />
              </Card>
              <Card>
                <Stat
                  label="SKS"
                  value={driverClasses.sks === '-' ? '-' : `K${driverClasses.sks}`}
                />
              </Card>
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
