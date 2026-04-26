import { Button, type ButtonProps } from '@mantine/core';
import { IconPrinter } from '@tabler/icons-react';

/**
 * A button component that triggers the print dialog when clicked.
 * It is styled to be compact and transparent by default, and it includes a
 * printer icon.
 *
 * The button is hidden when printing.
 */
const PrintButton = ({ size, variant, ms, className, ...props }: ButtonProps) => {
  const classes = ['no-print', className].filter(Boolean).join(' ');

  const handlePrint = () => {
    if (!window) {
      console.error('Window object is not available. Unable to print.');
      return;
    }

    window.print();
  };

  return (
    <Button
      onClick={handlePrint}
      className={classes}
      size={size ?? 'compact-xs'}
      variant={variant ?? 'transparent'}
      ms={ms ?? 'auto'}
      {...props}
    >
      <IconPrinter />
    </Button>
  );
};

export default PrintButton;
