import { useEffect, useState } from "react";
import { StudyResource } from "../../types";
import "../ui/uiStyles.css";
import { truncateFileName } from "../../lib/utils";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Study } from "@/types";
import { CurrentStudy } from "@/app/context/StudyContext";

type PDFViewerProps = {
  study: Study | undefined;
};

const PdfViewer = () => {
  const currentStudyContext = CurrentStudy();
  // make sure currentStudyContext is not undefined
  if (!currentStudyContext) {
    return null;
  }

  const [pdfs, setPdfs] = useState<StudyResource[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pdfUrl, setPdfUrl] = useState("");

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
    const loadPdf = async () => {
      if (pdfs.length > 0 && pdfs[currentIndex]) {
        const currentPdfUrl = pdfs[currentIndex].identifier;

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
    };

    loadPdf();

    // Cleanup function to revoke the object URL to avoid memory leaks
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
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
      <div className="flex flex-row items-center justify-center mb-6">
        <button
          onClick={goToPreviousPdf}
          className="p-4 text-xs rounded-xl m-2 w-20 text-symbiont-textUnSelected  "
        >
          Previous
        </button>
        <button
          onClick={goToNextPdf}
          className=" p-4 text-xs rounded-xl m-2 w-20 text-symbiont-textUnSelected"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PdfViewer;
