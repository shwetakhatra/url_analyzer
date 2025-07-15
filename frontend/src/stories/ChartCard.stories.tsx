import { ChartCard } from "../components/ui/chart/ChartCard";

export default {
  title: "Components/ChartCard",
  component: ChartCard,
};

export const Default = () => <ChartCard internalLinks={12} externalLinks={8} />;

export const NoLinks = () => <ChartCard internalLinks={0} externalLinks={0} />;

export const ManyLinks = () => (
  <ChartCard internalLinks={100} externalLinks={50} />
);
