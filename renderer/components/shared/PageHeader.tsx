import { Title } from '@mantine/core';

type PageHeaderProps = {
  title: string;
};

const PageHeader = ({ title }: PageHeaderProps) => {
  return (
    <header>
      <Title>{title}</Title>
    </header>
  );
};

export default PageHeader;
