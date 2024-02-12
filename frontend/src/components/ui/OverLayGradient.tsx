import "../ui/uiStyles.css";
type OverLayGradientProps = {
  height?: string;
  width?: string;
};
const OverLayGradient = ({
  height = "20",
  width = "50",
}: OverLayGradientProps) => {
  const tailwind = `h-${height} w-${width}`;

  return <div className={`${tailwind} button-gradient rounded-2xl`}></div>;
};

export default OverLayGradient;
