import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

type Props = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

const Providers = (children: Props) => {
  return (
    <div>
      <QueryClientProvider client={queryClient}> {children}</QueryClientProvider>
    </div>
  );
};

export default Providers;
