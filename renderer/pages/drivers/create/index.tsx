import Layout from '@/components/shared/Layout';
import PageHeader from '@/components/shared/PageHeader';
import {
  GENDER_OPTIONS,
  JKS_CLASSES,
  MIN_JKS_DRIVER_AGE,
  MIN_SKS_DRIVER_AGE,
  SKS_CLASSES,
} from '@/lib/constants';
import database from '@/lib/database';
import { getJksClass, getSksClass } from '@/lib/misc/getDriverClass';
import { Button, Group, NativeSelect, NumberInput, Stack, Text, TextInput } from '@mantine/core';
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

const CreateDriverPage = () => {
  const router = useRouter();
  const form = useForm<Driver>({
    initialValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      sex: 'male',
      driverClass: {
        jks: 0,
        sks: 1,
      },
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

    form.setFieldValue('driverClass.jks', classJKS as Driver['driverClass']['jks']);
    form.setFieldValue('driverClass.sks', classSKS as Driver['driverClass']['sks']);
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

  const driverAge = calculateDriverAge(form.values.birthDate) ?? 0;

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
              <NumberInput
                disabled={driverAge < MIN_JKS_DRIVER_AGE || !form.values.birthDate}
                description="Die JKS-Klasse wird automatisch basierend auf dem Geburtsdatum berechnet. Kann allerdings manuell angepasst werden."
                min={Math.min(...JKS_CLASSES)}
                max={Math.max(...JKS_CLASSES)}
                label="Klasse JKS"
                {...form.getInputProps('driverClass.jks')}
                key={form.key('driverClass.jks')}
              />
              <NumberInput
                disabled={driverAge < MIN_SKS_DRIVER_AGE || !form.values.birthDate}
                description="Die SKS-Klasse wird automatisch basierend auf dem Geburtsdatum berechnet. Kann allerdings manuell angepasst werden."
                min={Math.min(...SKS_CLASSES)}
                max={Math.max(...SKS_CLASSES)}
                label="Klasse SKS"
                {...form.getInputProps('driverClass.sks')}
                key={form.key('driverClass.sks')}
              />
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
