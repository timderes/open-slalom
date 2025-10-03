import Layout from "@/components/shared/Layout";
import PageHeader from "@/components/shared/PageHeader";
import database from "@/lib/database";
import { Container, Stack } from "@mantine/core";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/router";

const DriverViewPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  const driver = useLiveQuery(() => database.drivers.get(uuid.toString()));

  if (!driver) {
    return undefined;
  }

  return (
    <Layout currentRoute="/drivers/view/[uuid]">
      <Container my="sm">
        <Stack>
          <PageHeader title={driver.firstName + " " + driver.lastName} />
        </Stack>
      </Container>
    </Layout>
  );
};

export default DriverViewPage;
