"use client";
import { useEffect, useState } from "react";
import { StudyResource } from "../../types";

import { truncateFileName } from "../../lib/utils";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Study } from "@/types";
import { useStudyContext } from "@/app/context/StudyContext";
import Button from "@mui/material/Button";
import { UserAuth } from "@/app/context/AuthContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

type PDFViewerProps = {
  study: Study | undefined;
};

const PdfViewer = () => {
  const currentStudyContext = useStudyContext();
  const authContext = UserAuth();
  const [userUid, setUserUid] = useState<string>("");

  const [pdfs, setPdfs] = useState<StudyResource[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pdfUrl, setPdfUrl] = useState("");

  const pdfBaseUrl = `userFiles/${userUid}/`;

  const filterPdfs = (allResources: StudyResource[]) => {
    return allResources.filter((resource) => resource.category === "pdf");
  };

  useEffect(() => {
    if (currentStudyContext?.study) {
      const allResources = currentStudyContext.study.resources;
      setPdfs(filterPdfs(allResources));
    }
  }, [currentStudyContext]);

  useEffect(() => {
    if (authContext && authContext.user) {
      setUserUid(authContext.user.uid);
    }
  }, [authContext]);

  useEffect(() => {
    const loadPdf = async () => {
      if (pdfs.length > 0 && pdfs[currentIndex]) {
        const currentPdfUrl = pdfBaseUrl + pdfs[currentIndex].identifier;

        try {
          const storage = getStorage();
          const storageRef = ref(storage, currentPdfUrl);
          const url = await getDownloadURL(storageRef);
          setPdfUrl(url);
        } catch (error) {
          console.error("Error loading PDF", error);
          setPdfUrl("");
        }
      }
      // Cleanup function to revoke the object URL to avoid memory leaks
      return () => {
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }
      };
    };

    if (!currentStudyContext) {
      return; // Changed from 'return null;' to 'return;'
    }
    loadPdf();
  }, [currentIndex, pdfs]);

  const goToPreviousPdf = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  const goToNextPdf = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < pdfs.length - 1 ? prevIndex + 1 : prevIndex
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
