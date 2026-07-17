import Layout from '@/components/shared/Layout';
import PageHeader from '@/components/shared/PageHeader';
import { GENDER_OPTIONS } from '@/lib/constants';
import database from '@/lib/database';
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
import Stat from '@/components/shared/Stat';
import { getJksClass, getSksClass } from '@/lib/misc/getDriverClass';
import dateParser from '@/lib/dates/dateParser';
import log from 'electron-log/renderer';

const CreateDriverPage = () => {
  const router = useRouter();
  const form = useForm<Driver>({
    initialValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: 'male',
      uuid: uuidv4(),
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
      gender: isNotEmpty('Dieses Feld darf nicht leer sein.'),
    },
    validateInputOnChange: true,
  });

  const handleCreateDriver = () => {
    database.drivers
      .add(form.values)
      .then(() => {
        const { firstName, lastName, uuid } = form.values;

        log.info(`The driver ${firstName} ${lastName} (UUID ${uuid}) was created successfully.`);

        notifications.show({
          icon: <IconHelmet />,
          title: 'Fahrer angelegt',
          message: `${firstName} ${lastName} wurde erfolgreich angelegt.`,
          color: 'green',
        });

        form.reset();
        router.push('/drivers');
      })
      .catch((error) => {
        log.error('Error occurred while creating a new driver:', error);
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
                dateParser={dateParser}
                clearable
                valueFormat="DD.MM.YYYY"
                onChange={(value) => form.setFieldValue('birthDate', value)}
                label="Geburtsdatum"
                placeholder="TT.MM.JJJJ"
                key={form.key('birthDate')}
                error={form.getInputProps('birthDate').error}
              />
              <NativeSelect
                label="Geschlecht"
                data={GENDER_OPTIONS}
                key={form.key('gender')}
                {...form.getInputProps('gender')}
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
