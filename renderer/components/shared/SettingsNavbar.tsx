import { SETTINGS_ROUTES } from '@/lib/constants';
import { NavLink, type NavLinkProps } from '@mantine/core';

type SettingsNavbarProps = {
  currentRoute: string;
} & NavLinkProps;

const SettingsNavbar = ({ currentRoute, ...props }: SettingsNavbarProps) => {
  return (
    <>
      {SETTINGS_ROUTES.map((route) => (
        <NavLink
          autoContrast
          active={currentRoute === route.path}
          key={route.path}
          label={props.label ?? route.label}
          href={route.path}
          {...props}
        />
      ))}
    </>
  );
};

export default SettingsNavbar;
