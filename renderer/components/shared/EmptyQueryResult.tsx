import { Container, Stack, Text, Title } from '@mantine/core';
import { IconFileUnknown } from '@tabler/icons-react';

type EmptyQueryResultProps = {
  title: string;
} & React.PropsWithChildren;

const EmptyQueryResult = ({ children, title }: EmptyQueryResultProps) => {
  return (
    <Container component={Stack} my="xl">
      <IconFileUnknown size={96} style={{ margin: '0 auto' }} />
      <Title order={2} ta="center">
        {title}
      </Title>
      <Text ta="center">{children}</Text>
    </Container>
  );
};

export default EmptyQueryResult;
