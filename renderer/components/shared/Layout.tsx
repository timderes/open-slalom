import {
  APP_NAME,
  APP_ROUTES,
  APP_VERSION,
  DEFAULT_DATE_FORMAT,
  DEFAULT_TIME_FORMAT,
} from "@/lib/constants";
import { AppShell, Burger, Group, NavLink, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useEffect, useState } from "react";

type LayoutProps = { currentRoute: string } & React.PropsWithChildren;

export const APP_HEADER_HEIGHT = 60; // px
export const APP_FOOTER_HEIGHT = 60; // px
export const APP_NAVBAR_WIDTH = 200; // px
export const APP_ASIDE_WIDTH = 300; // px

const CURRENT_DATE = new Date().toLocaleDateString("de", {
  ...DEFAULT_DATE_FORMAT,
});

/**
 * Default layout for the app. With header, footer, navbar and aside sections.
 */
const Layout = ({ currentRoute, children }: LayoutProps) => {
  const [CURRENT_TIME, setCurrentTime] = useState<string | null>(null);

  const [opened, { toggle }] = useDisclosure();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("de", {
          ...DEFAULT_TIME_FORMAT,
        })
      );
    }, 1000);
    setCurrentTime(
      new Date().toLocaleTimeString("de", {
        ...DEFAULT_TIME_FORMAT,
      })
    );
    return () => clearInterval(interval);
  }, []);

  if (!CURRENT_TIME) return null;

  return (
    <AppShell
      header={{ height: APP_HEADER_HEIGHT }}
      footer={{ height: APP_FOOTER_HEIGHT }}
      navbar={{
        width: APP_NAVBAR_WIDTH,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: opened },
      }}
      padding={0}
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} size="sm" />
          {APP_NAME}
          <Text ms="auto">
            {CURRENT_DATE} {CURRENT_TIME}
          </Text>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {APP_ROUTES.map((route) => (
          <NavLink
            active={currentRoute === route.path}
            key={route.path}
            href={route.path}
            component={Link}
            label={route.label}
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
      <AppShell.Footer p="md">{APP_VERSION}</AppShell.Footer>
    </AppShell>
  );
};

export default Layout;
