import { Container, Text } from "@mantine/core";
import PageHeader from "./PageHeader";

type EmptyQueryResultProps = {
  title: string;
} & React.PropsWithChildren;

const EmptyQueryResult = ({ children, title }: EmptyQueryResultProps) => {
  return (
    <Container my="sm">
      <PageHeader title={title} />
      <Text>{children}</Text>
    </Container>
  );
};

export default EmptyQueryResult;
