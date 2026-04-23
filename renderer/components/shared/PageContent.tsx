import { Container, type ContainerProps, Stack } from "@mantine/core";

type PageContentProps = ContainerProps & React.PropsWithChildren;

/**
 * Wraps the main content of a page in a consistent container with spacing.
 */
const PageContent = ({ children, my = "sm", ...props }: PageContentProps) => {
  return (
    <Container my={my} {...props}>
      <Stack>{children}</Stack>
    </Container>
  );
};

export default PageContent;
