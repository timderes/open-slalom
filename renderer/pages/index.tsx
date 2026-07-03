import { Center, Image, Stack, Text } from '@mantine/core';
import Layout from '@/components/shared/Layout';
import { APP_MAIN_HEIGHT, APP_NAME } from '@/lib/constants';

const IndexPage = () => {
  return (
    <Layout currentRoute="/">
      <Center h={APP_MAIN_HEIGHT} ta="center">
        <Stack>
          <Image alt="" draggable={false} h={300} w="auto" fit="contain" src="images/logo.png" />
          <Text
            fw={900}
            fz="h1"
            variant="gradient"
            gradient={{ from: 'blue', to: 'blue.9', deg: 33 }}
          >
            {APP_NAME}
          </Text>
        </Stack>
      </Center>
    </Layout>
  );
};

export default IndexPage;
