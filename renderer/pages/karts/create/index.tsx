import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import database from '@/lib/database';
import { Button, Group, SegmentedControl, Stack, Text, TextInput } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import log from 'electron-log/renderer';

const CreateKartPage = () => {
  const router = useRouter();
  const form = useForm<Kart>({
    initialValues: {
      uuid: uuidv4(),
      name: '',
      chassis: '',
      engine: '',
      type: 'JKS',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    validate: {
      name: isNotEmpty('Dieses Feld darf nicht leer sein.'),
      engine: isNotEmpty('Dieses Feld darf nicht leer sein.'),
      chassis: isNotEmpty('Dieses Feld darf nicht leer sein.'),
    },

    validateInputOnChange: true,
  });

  const handleCreateKart = () => {
    database.karts
      .add(form.values)
      .then(() => {
        const { name } = form.values;

        notifications.show({
          title: 'Kart angelegt',
          message: `${name} wurde erfolgreich angelegt.`,
          color: 'green',
        });

        router.push('/karts');
      })
      .catch((error) => {
        log.error('Error occurred while creating a new kart:', error);

        notifications.show({
          title: 'Fehler beim Anlegen des Karts',
          message: `Das Kart konnte nicht angelegt werden. Fehler: ${error}`,
          color: 'red',
        });
      });
  };

  const handleGoBack = () => {
    if (!form.isDirty()) {
      // Skip confirmation modal if form is not dirty
      router.push('/karts');
      return;
    }

    modals.openConfirmModal({
      title: 'Kart nicht anlegen?',
      centered: true,
      children: <Text>Bereits eingetragene Informationen werden nicht gespeichert!</Text>,
      labels: { confirm: 'Ja', cancel: 'Nein' },
      onConfirm: () => router.push('/karts'),
    });
  };

  return (
    <Layout currentRoute="/karts">
      <PageContent>
        <PageHeader title="Kart anlegen" />
        <form
          onSubmit={form.onSubmit(
            () => handleCreateKart(),
            (errors) => {
              // Focus first invalid field
              const getFirstErrorField = Object.keys(errors)[0];
              form.getInputProps(getFirstErrorField).onFocus();
            },
          )}
        >
          <Stack>
            <Group grow align="end">
              <TextInput
                label="Kart"
                placeholder="Kart #1"
                {...form.getInputProps('name')}
                key={form.key('name')}
              />
              <SegmentedControl
                color="blue"
                data={['JKS', 'SKS']}
                value={form.values.type}
                onChange={(value) => form.setFieldValue('type', value)}
              />
            </Group>
            <Group grow>
              <TextInput
                label="Motor"
                placeholder="Honda GX-200"
                {...form.getInputProps('engine')}
                key={form.key('engine')}
              />
              <TextInput
                label="Chassis"
                placeholder="Mach1"
                {...form.getInputProps('chassis')}
                key={form.key('chassis')}
              />
            </Group>
            <Group mt="xl">
              <Button type="submit">Kart erstellen</Button>
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

export default CreateKartPage;
