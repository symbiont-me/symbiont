import React from "react";
import { useState, useEffect } from "react";
import { Study } from "@/types";
import { useStudyContext } from "@/app/context/StudyContext";

const Summaries = () => {
  const studyContext = useStudyContext();
  const [study, setStudy] = useState<Study | undefined>(undefined);

  useEffect(() => {
    if (studyContext) {
      setStudy(studyContext.study);
    }
  }, [studyContext]);

  return (
    <div>
      <h1>Summaries</h1>
      {studyContext?.isStudyLoading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {study?.resources.map((resource) => (
            <div key={resource.identifier}>
              <li>
                <a
                  href={resource.url}
                  className="hover:underline text-symbiont-chatMessageUser"
                >
                  {resource.name}
                </a>
              </li>
              <p>{resource.summary}</p>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Summaries;
