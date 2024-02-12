import { useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { StudyResource } from "../../types";
import "../ui/uiStyles.css";
type PDFViewerProps = {
  studyId: string;
};
// TODO display the PDF name
const PdfViewer = ({ studyId }: PDFViewerProps) => {
  const [pdfs, setPdfs] = useState<StudyResource[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pdfUrl, setPdfUrl] = useState("");

  const pdfQuery = useQuery({
    queryKey: ["pdfViewer", studyId, "pdf"],
    queryFn: async () => {
      const response = await axios.post("/api/get-pdfs", {
        studyId: studyId,
        category: "pdf",
      });
      return response.data;
    },
  });

  useEffect(() => {
    if (pdfQuery.data) {
      setPdfs(pdfQuery.data);
    }
  }, [pdfQuery.data]);

  useEffect(() => {
    const loadPdf = async () => {
      if (pdfs.length > 0 && pdfs[currentIndex]) {
        const currentPdfUrl = pdfs[currentIndex].url;
        try {
          const response = await fetch(currentPdfUrl);
          const existingPdfBytes = await response.arrayBuffer();
          const blob = new Blob([existingPdfBytes], {
            type: "application/pdf",
          });
          // @note using Blob intead of a byte array to avoid security issues
          const blobUrl = URL.createObjectURL(blob);
          setPdfUrl(blobUrl);
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
      <div className="flex flex-row items-center justify-center">
        <button
          onClick={goToPreviousPdf}
          className="p-4 text-xs rounded-xl m-2 w-20 border text-symbiont-textUnSelected bg-symbiont-800"
        >
          Previous
        </button>
        <button
          onClick={goToNextPdf}
          className=" p-4 text-xs rounded-xl m-2 w-20 border text-symbiont-textUnSelected"
        >
          Next
        </button>
      </div>
      {pdfUrl && (
        <>
          <h3 className="text-xs p-2">{pdfs[currentIndex].name}</h3>
          <iframe src={pdfUrl} className="w-full h-full"></iframe>
        </>
      )}
    </div>
  );
};

export default PdfViewer;
