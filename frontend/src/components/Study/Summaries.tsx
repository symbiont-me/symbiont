import React from "react";
import { ViewSelected } from "@/const/index";
import { useFetchSummaries } from "@/hooks/useFetchSummaries";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Study } from "@/types";

// TODO call get-summaries route

type Summary = {
  name: string;
  identifier: string;
  url: string;
  summary: string;
};
// TODO get Study from the parent component
const Summaries = ({ study }: { study: Study }) => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const { data, isLoading, isError, error } = useFetchSummaries(
    study.id!.toString()
  );
  useEffect(() => {
    if (data && data.summaries) {
      setSummaries(data.summaries);
    }
  }, [summaries, data]);

  return (
    <div>
      <h1>Summaries</h1>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error: {error?.message}</div>}
      <ul>
        {summaries.map((summary) => (
          <>
            <li key={summary.identifier}>
              <a
                href={summary.url}
                className="hover:underline text-symbiont-chatMessageUser"
              >
                {summary.name}
              </a>
            </li>
            <p>{summary.summary}</p>
          </>
        ))}
      </ul>
    </div>
  );
};

export default Summaries;
