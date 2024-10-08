'use client'
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import {useState} from "react";
type Props = {
  children: React.ReactNode;
};



const ReactQueryProvider = ({children}: Props) => {
const [client] = useState(() => new QueryClient());
  return (
    <>
      <QueryClientProvider client={client}> {children}</QueryClientProvider>
    </>
  );
};

export default ReactQueryProvider;
