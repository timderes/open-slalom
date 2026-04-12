import Layout from "@/components/shared/Layout";
import database from "@/lib/database";
import { Container } from "@mantine/core";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/router";

// TODO: Implement driver edit functionality here
const DriverEditPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  const driver = useLiveQuery(() => database.drivers.get(uuid.toString()));

  if (!driver) {
    return undefined;
  }

  return (
    <Layout currentRoute="/drivers">
      <Container my="sm">{uuid}</Container>
    </Layout>
  );
};

export default DriverEditPage;
