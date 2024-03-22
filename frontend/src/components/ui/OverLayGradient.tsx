import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { UserAuth } from "@/app/context/AuthContext";

// TODO modify this component doesn't need to be this complicated
// TODO add onClick to handle LLM settings
type OverLayGradientProps = {
  height?: string;
  width?: string;
};
const OverLayGradient = ({
  height = "20",
  width = "50",
}: OverLayGradientProps) => {
  const tailwind = `h-${height} w-${width}`;

  const authContext = UserAuth();

  return (
    <div
      className={`${tailwind} button-gradient rounded-2xl flex flex-row items-center justify-between`}
    >
      <div className="ml-2 flex flex-row items-center h-2">
        {authContext?.user && (
          <img
            src={authContext.user.photoURL || ""}
            className="rounded-full h-10 m-2"
          />
        )}
        <p className="text-xs">
          {authContext?.user ? authContext.user.displayName : "Guest"}
        </p>
      </div>
      <FontAwesomeIcon
        icon={faGear}
        color="#686B6E"
        className="mr-4 cursor-pointer"
      />
    </div>
  );
};

export default OverLayGradient;
