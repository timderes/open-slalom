import { SETTINGS_ROUTES } from '@/lib/constants';
import { NavLink, type NavLinkProps } from '@mantine/core';
import Link from 'next/link';

type SettingsNavbarProps = {
  currentRoute: string;
} & Omit<NavLinkProps, 'active' | 'href' | 'label'>;

const SettingsNavbar = ({ currentRoute, ...props }: SettingsNavbarProps) => {
  return (
    <>
      {SETTINGS_ROUTES.map((route) => (
        <NavLink
          {...props}
          autoContrast={props.autoContrast ?? true}
          component={Link}
          active={currentRoute === route.path}
          key={route.path}
          label={route.label}
          href={route.path}
        />
      ))}
    </>
  );
};

export default SettingsNavbar;
