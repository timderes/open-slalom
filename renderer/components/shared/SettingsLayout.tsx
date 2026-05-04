import { Grid } from '@mantine/core';
import SettingsNavbar from './SettingsNavbar';

type SettingsLayoutProps = React.PropsWithChildren & {
  currentRoute: string;
};

const SettingsLayout = ({ currentRoute, children }: SettingsLayoutProps) => {
  return (
    <Grid>
      <Grid.Col span={3}>
        <SettingsNavbar currentRoute={currentRoute} />
      </Grid.Col>
      <Grid.Col span="auto">{children}</Grid.Col>
    </Grid>
  );
};

export default SettingsLayout;
