import { useEffect, useState } from "react";
import axios from "axios";
import { StudyResource } from "@/types";
import { useQuery } from "@tanstack/react-query";

type PDFViewerProps = {
  studyId: string;
};
// TODO replace Google Viewer with a better PDF viewer
//  TODO need to add a loader to show when pdf is loading when clicked Next or Previous
/*
 * TODO fix error below
 * Refused to execute inline script because it violates the following Content Security Policy
 * directive: "script-src 'report-sample' 'nonce-ri5IuITOGnLsdMi2beov1A' 'unsafe-inline'
 * 'strict-dynamic' https: http: 'unsafe-eval'". Note that 'unsafe-inline' is ignored if
 * either a hash or nonce value is present in the source list.
 */

const PdfViewer = ({ studyId }: PDFViewerProps) => {
  const [pdfs, setPdfs] = useState<StudyResource[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  if (pdfQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (pdfQuery.isError) {
    return <div>Error: {pdfQuery.error.message}</div>;
  }

  // console.log(pdfs);
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
      <div className="flex flex-row">
        <button onClick={goToPreviousPdf}>Previous</button>
        <button onClick={goToNextPdf}>Next</button>
      </div>
      {pdfs.length > 0 && (
        <iframe
          src={`https://docs.google.com/gview?url=${pdfs[currentIndex].url}&embedded=true`}
          className="w-full h-screen"
        ></iframe>
      )}
    </div>
  );
}

export default PdfViewer;
