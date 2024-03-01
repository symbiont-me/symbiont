import { useEffect, useState } from "react";
import { StudyResource } from "../../types";
import "../ui/uiStyles.css";
import { truncateFileName } from "../../lib/utils";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useFetchResources } from "@/hooks/useFetchResources";

type PDFViewerProps = {
  studyId: string;
};

const PdfViewer = ({ studyId }: PDFViewerProps) => {
  const [pdfs, setPdfs] = useState<StudyResource[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pdfUrl, setPdfUrl] = useState("");

  const filterPdfs = (pdfs: StudyResource[]) => {
    return pdfs.filter((pdf) => pdf.category === "pdf");
  };

  const {
    data: resourcesData,
    isLoading,
    isError,
    error,
  } = useFetchResources(studyId);

  useEffect(() => {
    if (resourcesData) {
      setPdfs(filterPdfs(resourcesData.resources));
    }
  }, [resourcesData]);

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

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
