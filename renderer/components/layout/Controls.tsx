import { DEFAULT_TOOLTIP_PROPS } from "@/lib/constants";
import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { useFullscreen } from "@mantine/hooks";
import {
  IconMinus,
  IconWindowMaximize,
  IconWindowMinimize,
  IconX,
} from "@tabler/icons-react";

/**
 * Returns a group of window control buttons (minimize, maximize, close).
 */
const Controls = () => {
  /**
   * Manages the fullscreen state of the app.
   */
  const { toggle, fullscreen } = useFullscreen();

  /**
   * Closes the app. In development mode, the app will be relaunched for easier debugging.
   */
  const handleCloseApp = () => {
    window.ipc.send("app-quit", null);
  };

  /**
   * Minimizes the app window.
   */
  const handleMinimizeAppWindow = () => {
    window.ipc.send("app-minimize-window", null);
  };

  return (
    <Group>
      <Tooltip label="Minimieren" {...DEFAULT_TOOLTIP_PROPS}>
        <ActionIcon
          c="inherit"
          variant="subtle"
          onClick={handleMinimizeAppWindow}
        >
          <IconMinus />
        </ActionIcon>
      </Tooltip>
      <Tooltip
        label={fullscreen ? "Fenstermodus" : "Vollbild"}
        {...DEFAULT_TOOLTIP_PROPS}
      >
        <ActionIcon c="inherit" variant="subtle" onClick={toggle}>
          {fullscreen ? <IconWindowMinimize /> : <IconWindowMaximize />}
        </ActionIcon>
      </Tooltip>
      <Tooltip label="App schließen" {...DEFAULT_TOOLTIP_PROPS}>
        <ActionIcon c="inherit" variant="subtle" onClick={handleCloseApp}>
          <IconX />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};

export default Controls;
