import { useEffect, useState } from "react";
import axios from "axios";
import { StudyResource } from "@/app/types";
type PDFViewerProps = {
  pdfUrl: string[] | undefined;
};

// TODO use react-query
//  TODO need to add a loader to show when pdf is loading when clicked Next or Previous
/*
 * TODO fix error below
 * Refused to execute inline script because it violates the following Content Security Policy
 * directive: "script-src 'report-sample' 'nonce-ri5IuITOGnLsdMi2beov1A' 'unsafe-inline'
 * 'strict-dynamic' https: http: 'unsafe-eval'". Note that 'unsafe-inline' is ignored if
 * either a hash or nonce value is present in the source list.
 */

const PdfViewer = ({ pdfUrl }: PDFViewerProps) => {
  const [pdf, setPdf] = useState<StudyResource[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const getPdfs = async () => {
      const response = await axios.post("/api/get-pdfs", {
        studyId: 1,
        category: "pdf",
      });
      console.log(response.data);
      setPdf(response.data);
    };
    getPdfs();
    console.log(pdf);
  }, []);
  const goToPreviousPdf = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  const goToNextPdf = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < pdf.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <button onClick={goToPreviousPdf}>Previous</button>
        <button onClick={goToNextPdf}>Next</button>
      </div>
      {pdf.length > 0 && (
        <iframe
          src={`https://docs.google.com/gview?url=${pdf[currentIndex].url}&embedded=true`}
          className="w-full h-full"
        ></iframe>
      )}
    </div>
  );
};

export default PdfViewer;
