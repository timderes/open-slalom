import { Center, Image, Stack, Title } from '@mantine/core';
import Layout from '@/components/shared/Layout';
import { APP_FOOTER_HEIGHT, APP_HEADER_HEIGHT } from '@/components/shared/Layout';
import { APP_NAME } from '@/lib/constants';

const APP_MAIN_HEIGHT = `calc(100vh - ${APP_HEADER_HEIGHT}px - ${APP_FOOTER_HEIGHT}px)`;

const IndexPage = () => {
  return (
    <Layout currentRoute="/">
      <Center h={APP_MAIN_HEIGHT}>
        <Stack>
          <Image alt="" h={200} w="auto" fit="contain" src="images/logo.png" />
          <Title fs="italic" tt="uppercase">
            {APP_NAME}
          </Title>
        </Stack>
      </Center>
    </Layout>
  );
};

export default IndexPage;
