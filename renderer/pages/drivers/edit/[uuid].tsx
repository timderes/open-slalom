import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import Stat from '@/components/shared/Stat';
import { GENDER_OPTIONS, MAX_DRIVER_AGE, MIN_DRIVER_AGE } from '@/lib/constants';
import database from '@/lib/database';
import calculateDriverAge from '@/lib/misc/calculateDriverAge';
import { getJksClass, getSksClass } from '@/lib/misc/getDriverClass';
import { Button, Group, NativeSelect, Stack, TextInput, Text, Title, Card } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { hasLength, isInRange, isNotEmpty, useForm } from '@mantine/form';
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
      uuid: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    validate: {
      firstName: hasLength({ min: 2, max: 99 }, 'Der Vorname muss 2 bis 99 Zeichen lang sein.'),
      lastName: hasLength({ min: 2, max: 99 }, 'Der Nachname muss 2 bis 99 Zeichen lang sein.'),
      birthDate: (value) => {
        const age = calculateDriverAge(value);
        return (
          isInRange(
            { min: MIN_DRIVER_AGE, max: MAX_DRIVER_AGE },
            `Ungültiges Geburtsdatum. Fahrer müssen zwischen ${MIN_DRIVER_AGE} und ${MAX_DRIVER_AGE} Jahre alt sein.`,
          )(age) || isNotEmpty('Dieses Feld darf nicht leer sein.')(value)
        );
      },
      sex: isNotEmpty('Dieses Feld darf nicht leer sein.'),
    },
    validateInputOnChange: true,
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
                  value={
                    form.values.birthDate ? getJksClass({ birthDate: form.values.birthDate }) : '-'
                  }
                />
              </Card>
              <Card>
                <Stat
                  label="SKS"
                  value={
                    form.values.birthDate ? getSksClass({ birthDate: form.values.birthDate }) : '-'
                  }
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
