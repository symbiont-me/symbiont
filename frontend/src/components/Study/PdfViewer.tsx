import { useEffect, useState } from "react";
import axios from "axios";
import {StudyResource} from "@/app/types";
type Props = {
  pdfUrl: string[] | undefined;
};

// TODO allow users switch between  multiple pdfs
const PdfViewer = ({ pdfUrl }: Props) => {
  const [pdf, setPdf] = useState<StudyResource[]>([]);
  useEffect(() => {
    const getPdfs = async () => {
      const response = await axios.post("/api/get-pdfs", {
        studyId: 1,
        category: "pdf",
      });

      setPdf(response.data);
    };
    getPdfs();
    console.log(pdf);
  }, []);

  return (
    <div className = "flex flex-col">
      
      {pdf.length > 0 && (
        <iframe
          src={`https://docs.google.com/gview?url=${pdf[0].url}&embedded=true`}
          className="w-full h-full"
        ></iframe>
      )}

    </div>
  );
};

export default PdfViewer;
