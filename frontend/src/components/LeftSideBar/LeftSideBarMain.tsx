import "@/components/LeftSideBar/leftSideBar.css";
import OverLayGradient from "@/components/ui/OverLayGradient";
const LeftSideBarMain = () => {
  return (
    <div className="left-sidebar-container h-screen bg-symbiont-900 m-2 rounded-2xl ">
      <div className="mt-10 logo border-b-4 border-symbiont-800 flex flex-col items-center">
        <div className="h-10 w-10 rounded-full bg-symbiont-chatMessageUser"></div>
      </div>
      <div className="navigation border-b-4 border-symbiont-800 flex">
        <div className="flex flex-col p-6">
          <div className=" flex flex-row justify-center items-center mb-4">
            <div className="h-4 w-4 rounded-full bg-blue-600 mr-2"></div>
            <p className="text-sm">Home</p>
          </div>

          <div className=" flex flex-row justify-center items-center">
            <div className="h-4 w-4 rounded-full bg-blue-600 mr-2"></div>
            <p className="text-sm">Library</p>
          </div>
        </div>
      </div>

      <div className="projects-list border-symbiont-800">Projects List</div>
      <div className="settings p-2 flex flex-col flex-end">
        <OverLayGradient />
      </div>
    </div>
  );
};

export default LeftSideBarMain;
