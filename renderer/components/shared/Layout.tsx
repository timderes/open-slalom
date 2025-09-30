import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

type LayoutProps = React.PropsWithChildren;

export const APP_HEADER_HEIGHT = 60; // px
export const APP_FOOTER_HEIGHT = 60; // px
export const APP_NAVBAR_WIDTH = 300; // px
export const APP_ASIDE_WIDTH = 300; // px

/**
 * Default layout for the app. With header, footer, navbar and aside sections.
 */
const Layout = ({ children }: LayoutProps) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: APP_HEADER_HEIGHT }}
      footer={{ height: APP_FOOTER_HEIGHT }}
      navbar={{
        width: APP_NAVBAR_WIDTH,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      aside={{
        width: APP_ASIDE_WIDTH,
        breakpoint: "md",
        collapsed: { desktop: false, mobile: true },
      }}
      padding={0}
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          Header
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">Navbar</AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
      <AppShell.Aside p="md">Aside</AppShell.Aside>
      <AppShell.Footer p="md">Footer</AppShell.Footer>
    </AppShell>
  );
};

export default Layout;
