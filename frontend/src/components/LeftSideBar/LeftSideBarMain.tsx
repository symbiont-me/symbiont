import "@/components/LeftSideBar/leftSideBar.css";
const LeftSideBarMain = () => {
  return (
    <div className="left-sidebar-container h-full bg-symbiont-900 m-2 rounded-2xl ">
      <div className="mt-10 logo border-b-4 border-symbiont-800 flex flex-col items-center">
        <div className="h-10 w-10 rounded-full bg-symbiont-chatMessageUser"></div>
      </div>
      <div className="projects-list border-b-4 border-symbiont-800">
        Projects List
      </div>
      <div className="navigation border-b-4 border-symbiont-800">
        Navigation
      </div>
      <div className="settings border-t-2 border-symbiont-800">Settings</div>
    </div>
  );
};

export default LeftSideBarMain;
