import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Alert } from "@mantine/core";
import Layout from "@/components/shared/Layout";
import Head from "next/head";

export default function IndexPage() {
  const [message, setMessage] = React.useState("No message found");

  React.useEffect(() => {
    window.ipc.on("message", (message: string) => {
      setMessage(message);
    });
  }, []);

  return (
    <>
      <Head>
        <title>Startseite</title>
      </Head>
      <Layout>
        <div>
          <p>
            ⚡ Electron + Next.js ⚡ -<Link href="/next">Go to next page</Link>
          </p>
          <Image
            src="/images/logo.png"
            alt="Logo image"
            width={256}
            height={256}
          />
        </div>
        <div>
          <button
            onClick={() => {
              window.ipc.send("message", "Hello");
            }}
          >
            Test IPC
          </button>
          <p>{message}</p>
          <Alert
            variant="light"
            color="blue"
            title="Alert title"
            icon={undefined}
          >
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. At
            officiis, quae tempore necessitatibus placeat saepe.
          </Alert>
        </div>
      </Layout>
    </>
  );
}
