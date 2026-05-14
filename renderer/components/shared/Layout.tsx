import { APP_NAME, APP_ROUTES, APP_VERSION } from '@/lib/constants';
import { AppShell, type AppShellProps, Burger, Group, NavLink, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import Controls from '../layout/Controls';
import NetworkStatus from '../layout/NetworkStatus';
import OsStatus from '../layout/OsStatus';
import dynamic from 'next/dynamic';

type LayoutProps = {
  currentRoute: string;
  disableNavbar?: boolean;
} & AppShellProps &
  React.PropsWithChildren;

export const APP_HEADER_HEIGHT = 60; // px
export const APP_FOOTER_HEIGHT = 60; // px
export const APP_NAVBAR_WIDTH = 200; // px
export const APP_ASIDE_WIDTH = 300; // px

const Clock = dynamic(() => import('../layout/Clock'), {
  ssr: false,
});

/**
 * Default layout for the app. With header, footer, navbar and aside sections.
 */
const Layout = ({ currentRoute, disableNavbar = false, children, ...props }: LayoutProps) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: APP_HEADER_HEIGHT }}
      footer={{ height: APP_FOOTER_HEIGHT }}
      navbar={{
        width: APP_NAVBAR_WIDTH,
        breakpoint: 'sm',
        collapsed: {
          mobile: disableNavbar ? true : !opened,
          desktop: disableNavbar ? true : opened,
        },
      }}
      padding={0}
      {...props}
    >
      <AppShell.Header className="draggable no-print">
        <Group h="100%" px="md" justify="space-between">
          <Group>
            {disableNavbar ? null : <Burger opened={!opened} onClick={toggle} size="sm" />}
            {APP_NAME}
          </Group>
          <Controls />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar className="no-print">
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
      <AppShell.Footer px="md" component={Group} className="no-print">
        <Text>{APP_VERSION}</Text>
        <NetworkStatus />
        <OsStatus />
        <Clock />
      </AppShell.Footer>
    </AppShell>
  );
};

export default Layout;
