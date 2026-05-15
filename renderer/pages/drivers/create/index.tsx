import Layout from '@/components/shared/Layout';
import PageHeader from '@/components/shared/PageHeader';
import { GENDER_OPTIONS } from '@/lib/constants';
import database from '@/lib/database';
import { getJksClass, getSksClass } from '@/lib/misc/getDriverClass';
import { Button, Card, Group, NativeSelect, Stack, Text, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { hasLength, isInRange, isNotEmpty, useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconHelmet } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { MIN_DRIVER_AGE, MAX_DRIVER_AGE } from '@/lib/constants';
import calculateDriverAge from '@/lib/misc/calculateDriverAge';
import PageContent from '@/components/shared/PageContent';
import { useState } from 'react';
import Stat from '@/components/shared/Stat';

const CreateDriverPage = () => {
  const [driverClasses, setDriverClasses] = useState<{
    jks: string | number;
    sks: string | number;
  }>({
    jks: '-',
    sks: '-',
  });
  const router = useRouter();
  const form = useForm<Driver>({
    initialValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      sex: 'male',
      uuid: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    validate: {
      firstName: hasLength({ min: 2, max: 99 }, 'Dieses Feld darf nicht leer sein.'),
      lastName: hasLength({ min: 2, max: 99 }, 'Dieses Feld darf nicht leer sein.'),
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

  const handleBirthDateChange = (date: string) => {
    form.getInputProps('birthDate').onChange(date);

    const classJKS = getJksClass({ birthDate: date });
    const classSKS = getSksClass({ birthDate: date });

    setDriverClasses({
      jks: classJKS,
      sks: classSKS,
    });
  };

  const handleCreateDriver = () => {
    database.drivers.add(form.values).then(() => {
      const { firstName, lastName } = form.values;

      notifications.show({
        icon: <IconHelmet />,
        title: 'Fahrer angelegt',
        message: `${firstName} ${lastName} wurde erfolgreich angelegt.`,
        color: 'green',
      });

      form.reset();
      router.push('/drivers');
    });
  };

  const handleGoBack = () => {
    if (!form.isDirty()) {
      // Skip confirmation modal if form is not dirty
      router.push('/drivers');
      return;
    }

    modals.openConfirmModal({
      title: 'Fahrer nicht anlegen?',
      centered: true,
      children: <Text>Bereits eingetragene Informationen werden nicht gespeichert!</Text>,
      labels: { confirm: 'Ja', cancel: 'Nein' },
      onConfirm: () => router.push('/drivers'),
    });
  };

  return (
    <Layout currentRoute="/drivers">
      <PageContent>
        <PageHeader title="Fahrer anlegen" />
        <form
          onSubmit={form.onSubmit(
            () => handleCreateDriver(),
            (errors) => {
              // Focus first invalid field
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
                value={form.values.birthDate}
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
              <Button type="submit">Fahrer erstellen</Button>
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

export default CreateDriverPage;
