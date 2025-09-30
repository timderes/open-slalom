import Link from "next/link";
import Layout from "@/components/shared/Layout";

export default function NextPage() {
  return (
    <Layout>
      <div>
        <p>
          ⚡ Electron + Next.js ⚡ -<Link href="/">Go to home page</Link>
        </p>
      </div>
    </Layout>
  );
}
