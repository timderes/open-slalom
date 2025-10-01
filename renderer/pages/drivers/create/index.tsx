import Layout from "@/components/shared/Layout";
import { JKS_CLASSES, SKS_CLASSES } from "@/lib/constants";
import database from "@/lib/database";
import {
  getJksDriverClass,
  getSksDriverClass,
} from "@/lib/misc/getDriverClass";
import {
  Button,
  Container,
  Group,
  NumberInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";

const CreateDriverPage = () => {
  const router = useRouter();
  const form = useForm<Driver>({
    initialValues: {
      firstName: "",
      lastName: "",
      birthDate: "",
      sex: "male",
      driverClass: {
        jks: 0,
        sks: 1,
      },
      uuid: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    validate: {
      firstName: (value) => (value.length < 2 ? "Zu kurz" : null),
      lastName: (value) => (value.length < 2 ? "Zu kurz" : null),
      birthDate: (value) => (value ? null : "Bitte ein Datum auswählen"),
    },
  });

  const handleBirthDateChange = (date: string) => {
    form.getInputProps("birthDate").onChange(date);

    const classJKS = getJksDriverClass({ birthDate: date });
    const classSKS = getSksDriverClass({ birthDate: date });

    form.setFieldValue("driverClass.jks", classJKS);
    form.setFieldValue("driverClass.sks", classSKS);
  };

  const handleCreateDriver = () => {
    database.drivers.add(form.values).then(() => {
      form.reset();
      router.push("/drivers");
    });
  };

  return (
    <Layout currentRoute="/drivers/create">
      <Container my="sm">
        <Stack>
          <header>
            <Title>Fahrer anlegen</Title>
          </header>
          <Group grow>
            <TextInput
              label="Vorname"
              placeholder="Max"
              {...form.getInputProps("firstName")}
            />
            <TextInput
              label="Nachname"
              placeholder="Mustermann"
              {...form.getInputProps("lastName")}
            />
          </Group>
          <DateInput
            valueFormat="DD. MMMM YYYY"
            value={form.values.birthDate}
            onChange={(e) => handleBirthDateChange(e)}
            label="Geburtsdatum"
            placeholder="Geburtsdatum"
          />
          <Group grow>
            <NumberInput
              min={Math.min(...JKS_CLASSES)}
              max={Math.max(...JKS_CLASSES)}
              label="Klasse JKS"
              {...form.getInputProps("driverClass.jks")}
            />
            <NumberInput
              min={Math.min(...SKS_CLASSES)}
              max={Math.max(...SKS_CLASSES)}
              label="Klasse SKS"
              {...form.getInputProps("driverClass.sks")}
            />
          </Group>
          <Button
            disabled={!form.isValid()}
            ms="auto"
            w="fit-content"
            onClick={() => handleCreateDriver()}
          >
            Fahrer erstellen
          </Button>
        </Stack>
      </Container>
    </Layout>
  );
};

export default CreateDriverPage;
