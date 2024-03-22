"use client";
import { useEffect, useState } from "react";
import { StudyResource } from "../../types";

import { truncateFileName } from "../../lib/utils";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Study } from "@/types";
import { useStudyContext } from "@/app/context/StudyContext";
import Button from "@mui/material/Button";
import { UserAuth } from "@/app/context/AuthContext";

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
    <div className="flex flex-col h-viewerheight">
      <div className="flex flex-row items-center justify-center mt-4 mb-6 space-x-6">
        <Button
          variant="contained"
          onClick={goToPreviousPdf}
          disabled={currentIndex <= 0}
        >
          Previous
        </Button>

        <Button
          variant="contained"
          onClick={goToNextPdf}
          disabled={currentIndex + 1 >= pdfs.length}
        >
          Next
        </Button>
      </div>
      {pdfUrl && (
        <>
          <h3 className="text-xs p-2 text-center">
            {truncateFileName(pdfs[currentIndex].name)}
          </h3>
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            style={{ filter: "brightness(80%)" }}
          ></iframe>
        </>
      )}
    </div>
  );
};

export default PdfViewer;
