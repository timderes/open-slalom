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

const CreateKartPage = () => {
  const router = useRouter();
  const form = useForm<Kart>({
    initialValues: {
      name: '',
      engine: '',
      chassis: '',
      type: 'JKS',
      history: {
        usageByDriver: {},
        trainingUuids: [],
        totalLaps: 0,
        totalStints: 0,
        totalTime: 0,
        firstTraining: undefined,
        lastTraining: undefined,
      },
      uuid: uuidv4(),
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
        console.error('Error creating kart:', error);

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
      children: <Text>Bereits eingetragende Informationen werden nicht gespeichert!</Text>,
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
                placeholder="Jugendkart #1"
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
