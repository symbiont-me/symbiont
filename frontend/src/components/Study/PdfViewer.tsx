type Props = {
  pdfUrl: string | undefined;
};

// TODO allow users switch between  multiple pdfs
const PdfViewer = ({ pdfUrl }: Props) => {
  return (
    <iframe
      src={`https://docs.google.com/gview?url=${pdfUrl}&embedded=true`}
      className="w-full h-full"
    ></iframe>
  );
};

export default PdfViewer;
