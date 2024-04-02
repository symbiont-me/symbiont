import React from "react";
import { useState, useEffect } from "react";
import { Study } from "@/types";
import { useStudyContext } from "@/app/context/StudyContext";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import AccordionActions from "@mui/material/AccordionActions";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";

const Summaries = () => {
  const studyContext = useStudyContext();
  const [study, setStudy] = useState<Study | undefined>(undefined);

  useEffect(() => {
    if (studyContext) {
      setStudy(studyContext.study);
    }
  }, [studyContext?.study?.resources]);

  function deleteResource(resourceIdentifier: string) {
    studyContext?.deleteResource(resourceIdentifier);
  }

  return (
    <div>
      <div>
        <Typography variant="h3" sx={{ fontSize: 22 }}>
          Current Resources in the Study
        </Typography>
      </div>

      {studyContext?.isStudyLoading ? (
        <LinearProgress color="secondary" />
      ) : (
        <ul>
          {study?.resources.map((resource) => (
            <Accordion key={resource.identifier}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                {/* TODO what should be the href here? only for webpages or evey resource? */}
                <a
                  href={resource.url ? resource.url : "#"}
                  className="hover:underline text-blue-500"
                >
                  {resource.name}
                </a>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">{resource.summary}</Typography>
              </AccordionDetails>
              <AccordionActions>
                <Button onClick={() => deleteResource(resource.identifier)}>
                  Delete Resource
                </Button>
              </AccordionActions>
            </Accordion>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Summaries;
