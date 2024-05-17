"use client";
import { useEffect, useState } from "react";
import { StudyResource } from "../../types";

import { truncateFileName } from "../../lib/utils";

import { Study } from "@/types";
import { useStudyContext } from "@/app/context/StudyContext";
import Button from "@mui/material/Button";
import { UserAuth } from "@/app/context/AuthContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
type PDFViewerProps = {
  study: Study | undefined;
};

const PdfViewer = () => {
  const currentStudyContext = useStudyContext();
  const authContext = UserAuth();
  const [pdfs, setPdfs] = useState<StudyResource[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  const filterPdfs = (allResources: StudyResource[]) => {
    return allResources.filter((resource) => resource.category === "pdf");
  };

  useEffect(() => {
    if (currentStudyContext?.study) {
      const allResources = currentStudyContext.study.resources;
      setPdfs(filterPdfs(allResources));
    }
  }, [currentStudyContext?.study?.resources]);

  async function getFileFromStorage(storageRef: string) {
    const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/get-file-from-storage?storage_ref=${storageRef}`;
    const userToken = await authContext?.user?.getIdToken();
    if (!userToken) {
      return;
    }
    const headers = {
      Authorization: `Bearer ${userToken}`,
    };
    const res = await axios.get(endpoint, {
      headers,
      responseType: "arraybuffer",
    });
    return res.data;
  }

  const fileQuery = useQuery({
    queryKey: ["get-file", { storageRef: pdfs[currentIndex]?.storage_ref }],
    queryFn: async ({ queryKey }) => {
      const [_, queryValue] = queryKey;
      const { storageRef } = queryValue as { storageRef: string };
      return getFileFromStorage(storageRef);
    },
  });

  useEffect(() => {
    if (fileQuery.data) {
      const rawPdf = new Blob([fileQuery.data], { type: "application/pdf" });
      setPdfUrl(URL.createObjectURL(rawPdf));
    }
  }, [fileQuery.data]);

  const goToPreviousPdf = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  const goToNextPdf = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < pdfs.length - 1 ? prevIndex + 1 : prevIndex,
    );
  };

  return (
    <div className="flex flex-col">
      <div
        className="flex flex-col"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "white",
        }}
      >
        <div className="flex flex-row items-center justify-center space-x-6">
          <ArrowBackIcon
            onClick={goToPreviousPdf}
            sx={{
              cursor: currentIndex > 0 ? "pointer" : "auto",
              opacity: currentIndex <= 0 ? "0.3" : "1",
            }}
          >
            Previous
          </ArrowBackIcon>

          <ArrowForwardIcon
            onClick={goToNextPdf}
            sx={{
              cursor: currentIndex < pdfs.length - 1 ? "pointer" : "auto",
              opacity: currentIndex >= pdfs.length - 1 ? "0.3" : "1",
            }}
          >
            Next
          </ArrowForwardIcon>
        </div>
        <h3 className="text-xs p-2 text-center">
          {pdfs[currentIndex]
            ? truncateFileName(pdfs[currentIndex].name)
            : "No PDF available"}
        </h3>
      </div>
      {pdfUrl && (
        <>
          <iframe
            src={pdfUrl}
            style={{ width: "100%", height: "100vh" }}
            // style={{ filter: "brightness(90%)" }}
          ></iframe>
        </>
      )}
    </div>
  );
};

export default PdfViewer;
