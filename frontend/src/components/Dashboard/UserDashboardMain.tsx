import LeftSidebar from "../LeftSidebar";
import ProjectCard from "./ProjectCard";
import NewProjectCard from "./NewProjectCard";

// TODO get projects from db
// TODO handle errors in case of no projects

export default function UserDashboard() {
    return (
        <div className = "m-10">
            {/* Left Sidebar */}
            {/* Center Dashboard */}
            <div className="">
            <div className="grid grid-cols-4 gap-4">
                <ProjectCard title="test" img="" description=""/>
           
                <div className="border p-4">
                    <NewProjectCard/>
                </div>
                
            </div>
            </div>
        </div>
    )
}