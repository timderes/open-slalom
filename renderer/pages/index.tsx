import React from "react";
import { Center, Title } from "@mantine/core";
import Layout from "@/components/shared/Layout";
import Head from "next/head";
import {
  APP_FOOTER_HEIGHT,
  APP_HEADER_HEIGHT,
} from "@/components/shared/Layout";
import { APP_NAME } from "@/lib/constants";

const APP_MAIN_HEIGHT = `calc(100vh - ${APP_HEADER_HEIGHT}px - ${APP_FOOTER_HEIGHT}px)`;

/**
 * App entry point
 */
const IndexPage = () => {
  return (
    <>
      <Head>
        <title>{APP_NAME}</title>
      </Head>
      <Layout>
        <Center h={APP_MAIN_HEIGHT}>
          <Title fs="italic" tt="uppercase">
            {APP_NAME}
          </Title>
        </Center>
      </Layout>
    </>
  );
};

export default IndexPage;
