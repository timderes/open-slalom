import { SETTINGS_ROUTES } from '@/lib/constants';
import { NavLink, type NavLinkProps } from '@mantine/core';

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
