'use client'
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import {useState} from "react";
type Props = {
  children: React.ReactNode;
};



const Providers = ({children}: Props) => {
const [client] = useState(() => new QueryClient());
  return (
    <div>
      <QueryClientProvider client={client}> {children}</QueryClientProvider>
    </div>
  );
};

export default Providers;
