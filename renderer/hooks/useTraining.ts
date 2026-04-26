import { useEffect, useReducer } from 'react';
import { useStopwatch } from 'react-use-precision-timer';
import { useForm } from '@mantine/form';
import { v4 as uuidv4 } from 'uuid';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/router';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useHotkeys, useInterval } from '@mantine/hooks';
import {
  DEFAULT_STOPWATCH_INTERVAL,
  TIME_PENALTIES_JKS,
  TIME_PENALTIES_SKS,
} from '@/lib/constants';
import database from '@/lib/database';
import {
  initialState,
  trainingReducer,
  TrainingState,
  type TrainingAction,
} from '@/lib/training/trainingReducer';

type DisabledReasonKey = 'start' | 'lap' | 'update' | 'skip' | 'stop';

const useTraining = () => {
  const router = useRouter();
  const availableDrivers = useLiveQuery(() => database.drivers.toArray(), []);
  const stopwatch = useStopwatch();
  const settings = useForm<Training>({
    initialValues: {
      lapsPerStint: 3,
      drivers: [],
      mode: 'JKS',
      uuid: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    onValuesChange: () => {
      settings.setFieldValue('updatedAt', Date.now());
    },
  });

  const [state, dispatch] = useReducer(trainingReducer, {
    ...initialState,
    lapsPerStint: settings.values.lapsPerStint,
  });

  const hasDriver = !!state.currentDriver;
  const hasDrivers = settings.values.drivers.length > 0;
  const isRunning = stopwatch.isRunning();
  const isFinished = state.laps.length === settings.values.lapsPerStint;
  const isFinalLapInThisStint = state.currentLap === settings.values.lapsPerStint;
  const trainingHasFinishedStints = settings.values.drivers.some(
    (driver) => (driver.stints?.length ?? 0) > 0,
  );
  const timePenalties = settings.values.mode === 'SKS' ? TIME_PENALTIES_SKS : TIME_PENALTIES_JKS;

  const notifyError = (title: string, message: string) =>
    notifications.show({
      color: 'red',
      title,
      message,
    });

  const notifyInfo = (title: string, message: string) =>
    notifications.show({
      color: 'blue',
      title,
      message,
    });

  const getDisabledReason = (key: DisabledReasonKey): string | undefined => {
    switch (key) {
      case 'start':
        if (isRunning) return 'Stoppuhr läuft';
        if (!hasDriver) return 'Bitte zuerst einen Fahrer auswählen.';
        if (isFinished) return 'Rundenlimit erreicht';
        return undefined;

      case 'lap':
        if (!isRunning) return 'Stoppuhr nicht gestartet';
        if (isFinished) return 'Rundenlimit erreicht';
        return undefined;

      case 'update':
        if (isRunning) return 'Stoppuhr läuft';
        if (!isFinished) return 'Stint unvollständig';
        return undefined;

      case 'skip':
        if (isRunning) return 'Stoppuhr läuft';
        if (!hasDrivers) return 'Keine Fahrer ausgewählt';
        return undefined;

      case 'stop':
        return isRunning ? 'Stoppuhr läuft' : undefined;

      default:
        return undefined;
    }
  };

  const applyAction = (action: TrainingAction) => {
    dispatch(action);
  };

  const handleStopwatchStart = () => {
    if (!hasDriver) {
      notifyError('Kein Fahrer', 'Bitte zuerst einen Fahrer auswählen.');
      return;
    }

    if (stopwatch.isRunning()) {
      notifyError('Stoppuhr läuft bereits', 'Die Stoppuhr ist bereits gestartet.');
      return;
    }

    if (isFinished) {
      notifyError(
        'Der Stint ist abgeschlossen',
        'Der Fahrer hat bereits alle Runden gefahren. Bitte nächsten Fahrer auswählen oder Stint zurücksetzen.',
      );
      return;
    }

    stopwatch.stop();
    stopwatch.start();
    applyAction({ type: 'START' });
  };

  const resetStint = () => {
    stopwatch.stop();
    applyAction({ type: 'RESET' });
    notifyInfo('Stint gelöscht', 'Alle Runden wurden zurückgesetzt.');
  };

  const handleStopwatchReset = () => {
    const hasProgress = state.laps.length > 0 || stopwatch.getElapsedRunningTime() > 0 || isRunning;

    if (hasProgress) {
      modals.openConfirmModal({
        title: 'Stint wirklich löschen?',
        centered: true,
        children: 'Alle Runden gehen verloren. Dies kann nicht rückgängig gemacht werden.',
        labels: { confirm: 'Stint löschen', cancel: 'Abbrechen' },
        confirmProps: { color: 'red' },
        onConfirm: () => resetStint(),
      });
      return;
    }

    resetStint();
  };

  const handleStopwatchLap = () => {
    if (!isRunning) {
      notifyError('Stoppuhr nicht gestartet', 'Bitte zuerst Start drücken.');
      return;
    }

    const wasFinalLap = isFinalLapInThisStint;
    applyAction({
      type: 'ADD_LAP',
      payload: { timestamp: stopwatch.getStartTime() },
    });

    if (wasFinalLap) {
      stopwatch.stop();
      applyAction({ type: 'STOP' });
      notifyInfo('Stint beendet', 'Alle Runden abgeschlossen.');
      return;
    }

    stopwatch.stop();
    stopwatch.start();
  };

  const handleAddDriver = (driver: DriverWithStints) => {
    const exists = settings.values.drivers.some((d) => d.uuid === driver.uuid);
    const updatedDrivers = exists
      ? settings.values.drivers.filter((d) => d.uuid !== driver.uuid)
      : [...settings.values.drivers, driver];

    settings.setFieldValue('drivers', updatedDrivers);
    applyAction({ type: 'SET_DRIVERS', payload: updatedDrivers });
  };

  const updateCurrentStateToNextDriver = () => {
    applyAction({ type: 'SKIP' });
  };

  const handleUpdateCurrentDriver = () => {
    if (!hasDriver) {
      notifyError('Kein Fahrer', 'Es ist kein Fahrer aktiv.');
      return;
    }

    if (!isFinished) {
      notifyError(
        'Stint unvollständig',
        'Es müssen alle Runden beendet werden, bevor zum nächsten Fahrer gewechselt werden kann.',
      );
      return;
    }

    settings.setFieldValue('drivers', (prevDrivers) =>
      prevDrivers.map((driver) =>
        driver.uuid === state.currentDriver?.uuid
          ? {
              ...driver,
              stints: [...(driver.stints ?? []), { laps: state.laps }],
              updatedAt: Date.now(),
            }
          : driver,
      ),
    );

    updateCurrentStateToNextDriver();

    // After going to the next driver, make a safety backup of the current state
    // in the local storage to prevent data loss in case of a crash or accidental refresh
    //
    // This backup can be used to restore the state and recover the training progress up
    // to the last completed stint
    const backup = JSON.stringify(state);
    const backupSizeInBytes = new Blob([backup]).size;

    // The local storage in chromium based browsers has a limit of 5 MB per origin,
    // but to be safe we only use 4.5 MB
    const maxBackupStorageSize = 4.5 * 1024 * 1024;

    if (backupSizeInBytes < maxBackupStorageSize) {
      try {
        localStorage.setItem('training-backup', backup);
      } catch (error: unknown) {
        notifyError(
          'Sicherheitsbackup fehlgeschlagen',
          `Es konnte kein Backup erstellt werden. Das Training kann fortgesetzt werden, aber bei einem Absturz kann Fortschritt verloren gehen. Fehler: ${error instanceof DOMException ? error.message : String(error)}`,
        );
      }
    } else {
      notifyError(
        'Sicherheitsbackup nicht möglich',
        'Die Trainingsdaten sind größer als 4,5 MB. Das Training kann fortgesetzt werden, aber bei einem Absturz kann Fortschritt verloren gehen.',
      );
    }
  };

  const handleSkipDriver = () => {
    if (!hasDrivers) return;
    if (isRunning) return;

    if (state.laps.length > 0) {
      modals.openConfirmModal({
        title: 'Fahrer wirklich überspringen?',
        centered: true,
        children: 'Alle Runden des aktuellen Fahrers gehen verloren. Wirklich überspringen?',
        labels: { confirm: 'Fahrer überspringen', cancel: 'Abbrechen' },
        confirmProps: { color: 'red' },
        onConfirm: () => updateCurrentStateToNextDriver(),
      });
      return;
    }

    updateCurrentStateToNextDriver();
  };

  const handleStopTraining = () => {
    modals.openConfirmModal({
      title: 'Training beenden?',
      centered: true,
      children:
        'Möchten Sie das Training wirklich beenden? Nicht abgeschlossene Stints werden nicht gespeichert!',
      labels: { confirm: 'Training beenden', cancel: 'Abbrechen' },
      onConfirm: () => {
        if (!hasDrivers || !trainingHasFinishedStints) {
          notifyError(
            'Das Training wurde nicht gespeichert',
            'Trainings ohne Fahrer oder abgeschlossene Stints werden nicht gespeichert.',
          );
          router.push('/');
          return;
        }

        database.trainings
          .add(settings.values)
          .then(() =>
            router
              .push(`/trainings/${settings.values.uuid}/view`)
              .then(() =>
                notifyInfo('Training gespeichert', 'Das Training wurde erfolgreich gespeichert.'),
              ),
          )
          .catch((error) =>
            notifyError(
              'Training konnte nicht gespeichert werden',
              error?.message || 'Unbekannter Fehler',
            ),
          );
      },
      confirmProps: { color: 'red' },
    });
  };

  const handleRestoreTraining = (backup: Partial<TrainingState>) => {
    if (!backup || !Array.isArray(backup.drivers)) {
      notifyError(
        'Wiederherstellung fehlgeschlagen',
        'Ungültiges Backup des Trainings. Bitte versuchen Sie es erneut.',
      );
      return;
    }

    // restore form values used elsewhere in the UI
    settings.setFieldValue('drivers', backup.drivers);
    if (typeof backup.lapsPerStint === 'number') {
      settings.setFieldValue('lapsPerStint', backup.lapsPerStint);
    }
    if (backup.mode) {
      settings.setFieldValue('mode', backup.mode);
    }

    // restore reducer state (stopwatch will remain stopped)
    applyAction({ type: 'RESTORE', payload: backup });
    notifyInfo(
      'Backup geladen',
      'Das Training wurde erfolgreich aus dem Backup wiederhergestellt.',
    );
  };

  const updateLapCones = (index: number, value: number | string) => {
    const cones = typeof value === 'number' ? value : Number(value);
    applyAction({
      type: 'UPDATE_LAP_CONES',
      payload: { index, cones: Number.isNaN(cones) ? 0 : cones },
    });
  };

  const updateLapGates = (index: number, value: number | string) => {
    const gates = typeof value === 'number' ? value : Number(value);
    applyAction({
      type: 'UPDATE_LAP_GATES',
      payload: { index, gates: Number.isNaN(gates) ? 0 : gates },
    });
  };

  const toggleLapInvalid = (index: number) => {
    applyAction({
      type: 'TOGGLE_LAP_INVALID',
      payload: { index },
    });
  };

  useEffect(() => {
    applyAction({ type: 'SET_DRIVERS', payload: settings.values.drivers });
  }, [settings.values.drivers]);

  useEffect(() => {
    applyAction({
      type: 'SET_LAPS_PER_STINT',
      payload: settings.values.lapsPerStint,
    });
  }, [settings.values.lapsPerStint]);

  useEffect(() => {
    applyAction({
      type: 'SET_MODE',
      payload: settings.values.mode,
    });
  }, [settings.values.mode]);

  const interval = useInterval(
    () =>
      applyAction({
        type: 'TICK',
        payload: stopwatch.getElapsedRunningTime(),
      }),
    DEFAULT_STOPWATCH_INTERVAL,
  );

  useEffect(() => {
    if (stopwatch.isRunning()) {
      interval.start();
    } else {
      interval.stop();
    }

    return () => {
      interval.stop();
    };
  }, [stopwatch.isRunning()]);

  useHotkeys([
    ['Q', () => handleStopwatchStart()],
    ['W', () => handleStopwatchLap()],
    ['E', () => handleStopwatchReset()],
    ['CTRL+S', () => handleUpdateCurrentDriver()],
    ['CTRL+D', () => handleSkipDriver()],
    // ["ESC", () => handleStopTraining()],
  ]);

  return {
    availableDrivers,
    settings,
    timePenalties,
    currentStint: {
      currentDriverIndex: state.currentDriverIndex,
      currentLap: state.currentLap,
      driver: state.currentDriver,
      laps: state.laps,
      time: state.time,
    } satisfies Stint,
    conditions: {
      hasDriver,
      hasDrivers,
      isRunning,
      isFinished,
      trainingHasFinishedStints,
      isFinalLapInThisStint,
    },
    getDisabledReason,
    actions: {
      start: handleStopwatchStart,
      lap: handleStopwatchLap,
      reset: handleStopwatchReset,
      addDriver: handleAddDriver,
      updateCurrentDriver: handleUpdateCurrentDriver,
      skipDriver: handleSkipDriver,
      stopTraining: handleStopTraining,
      updateLapCones,
      updateLapGates,
      toggleLapInvalid,
      restoreBackup: handleRestoreTraining,
    },
  };
};

export default useTraining;
