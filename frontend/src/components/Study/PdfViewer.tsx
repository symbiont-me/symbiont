import { useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { StudyResource } from "../../types";
import "../ui/uiStyles.css";
import { truncateFileName } from "../../lib/utils";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

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

  const pdfQuery = useQuery({
    queryKey: ["pdfViewer", studyId, "pdf"],
    queryFn: async () => {
      const response = await axios.post(
        `http://127.0.0.1:8000/get-resources/?studyId=${studyId}`
      );
      return response.data;
    },
  });

  useEffect(() => {
    if (pdfQuery.data) {
      setPdfs(pdfQuery.data.resources);
    }
  }, [pdfQuery.data]);

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

  if (pdfQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (pdfQuery.isError) {
    return <div>Error: {pdfQuery.error.message}</div>;
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
