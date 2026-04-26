import { Stack, type StackProps, Text } from '@mantine/core';

type StatProps = {
  label: string;
  value: string | number;
} & StackProps;

const Stat = ({ label, value, ...props }: StatProps) => {
  return (
    <Stack ta="center" gap={0} {...props}>
      <Text fw="bold">{value}</Text>
      <Text opacity={0.7}>{label}</Text>
    </Stack>
  );
};

export default Stat;
