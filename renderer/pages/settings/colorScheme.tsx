import PageContent from '@/components/shared/PageContent';
import PageHeader from '@/components/shared/PageHeader';
import {
  Center,
  SegmentedControl,
  type SegmentedControlItem,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { APP_NAME } from '@/lib/constants';
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';
import Layout from '@/components/shared/Layout';
import SettingsLayout from '@/components/shared/SettingsLayout';

/**
 * Icon size used for the color scheme options in the segmented control.
 */
const controlIconSize = 24; // px

/**
 * Options for the color scheme segmented control. Each option
 * has an icon and a label.
 *
 * Notice that `auto` is called "System" in the UI, for a better
 * user experience.
 */
const colorSchemeOptions: SegmentedControlItem[] = [
  {
    label: (
      <Center style={{ gap: 10 }}>
        <IconSun size={controlIconSize} />
        <Text>Hell</Text>
      </Center>
    ),
    value: 'light',
  },
  {
    label: (
      <Center style={{ gap: 10 }}>
        <IconMoon size={controlIconSize} />
        <Text>Dunkel</Text>
      </Center>
    ),
    value: 'dark',
  },
  {
    label: (
      <Center style={{ gap: 10 }}>
        <IconDeviceDesktop size={controlIconSize} />
        <Text>System</Text>
      </Center>
    ),
    value: 'auto',
  },
];

/**
 * Settings page for the color scheme. Allows the user to choose
 * between `light`, `dark` and `auto` (System) color schemes.
 */
const ColorSchemeSettingsPage = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { primaryColor } = useMantineTheme();

  return (
    <Layout currentRoute="/settings">
      <SettingsLayout currentRoute="/settings/colorScheme">
        <PageContent>
          <PageHeader title="Farbschema" />
          <Text>
            {APP_NAME} kann in einer hellen oder dunklen Farbvariante verwendet werden. Die
            Einstellung "System" passt die Farbvariante automatisch an die Systemeinstellung an.
          </Text>
          <Text>
            Die gewählte Einstellung wird gespeichert und beim nächsten Start der App
            wiederhergestellt.
          </Text>
          <SegmentedControl
            autoContrast
            color={primaryColor}
            data={colorSchemeOptions}
            value={colorScheme}
            onChange={setColorScheme}
            withItemsBorders={false}
          />
        </PageContent>
      </SettingsLayout>
    </Layout>
  );
};

export default ColorSchemeSettingsPage;
