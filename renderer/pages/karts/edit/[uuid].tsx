import EmptyQueryResult from '@/components/shared/EmptyQueryResult';
import Layout from '@/components/shared/Layout';
import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import database from '@/lib/database';
import { Button, Group, SegmentedControl, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const KartEditPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

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

  const kart = useLiveQuery(() => database.karts.get(uuid?.toString() ?? ''), [uuid], undefined);
  useEffect(() => {
    if (!kart) return;

    form.setValues({
      ...kart,
    });

    form.resetDirty();
    form.resetTouched();
  }, [kart]);

  const handleEditKart = () => {
    database.karts
      .update(uuid?.toString() ?? '', form.values)
      .then(() => {
        const { name } = form.values;

        notifications.show({
          title: 'Kart bearbeitet',
          message: `${name} wurde erfolgreich bearbeitet.`,
          color: 'green',
        });

        router.push('/karts');
      })
      .catch((error) => {
        console.error('Error updating kart:', error);

        notifications.show({
          title: 'Fehler beim Bearbeiten des Karts',
          message: `${kart.name} konnte nicht bearbeitet werden. Fehler: ${error}`,
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
      title: 'Kart nicht bearbeiten?',
      centered: true,
      children: <Text>Bereits eingetragende Informationen werden nicht gespeichert!</Text>,
      labels: { confirm: 'Ja', cancel: 'Nein' },
      onConfirm: () => router.push('/karts'),
    });
  };

  if (kart === undefined) {
    return (
      <Layout currentRoute="/karts">
        <PageContent>
          <Skeleton height={32} radius="sm" />
          <Skeleton height={12} mt={6} radius="sm" />
          <Skeleton height={12} mt={6} width="70%" radius="sm" />
          <Skeleton height={400} mt={20} radius="sm" />
        </PageContent>
      </Layout>
    );
  }

  if (!kart) {
    return (
      <Layout currentRoute="/karts">
        <EmptyQueryResult title="Kart nicht gefunden!">
          Kein Kart für UUID {uuid} gefunden.
        </EmptyQueryResult>
      </Layout>
    );
  }

  return (
    <Layout currentRoute="/karts">
      <PageContent>
        <PageHeader title="Kart bearbeiten" />
        <form
          onSubmit={form.onSubmit(
            () => handleEditKart(),
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
                onChange={(value) => form.setFieldValue('type', value as SlalomType)}
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

export default KartEditPage;
