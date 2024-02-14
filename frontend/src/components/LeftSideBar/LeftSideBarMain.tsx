import "@/components/LeftSideBar/leftSideBar.css";
import OverLayGradient from "@/components/ui/OverLayGradient";
import { useQuery } from "@tanstack/react-query";
import { UserAuth } from "@/app/context/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { Study } from "@/types";
import Link from "next/link";
import NavItem from "./NavItem";
import { faHouse, faBook } from "@fortawesome/free-solid-svg-icons";

const LeftSideBarMain = () => {
  const authContext = UserAuth();
  const userId = authContext?.user?.uid;
  const [studies, setStudies] = useState<Study[]>([]);
  if (userId) {
    const fetchLinkedChatQuery = useQuery({
      queryKey: ["get-studies", userId],
      queryFn: async () => {
        const response = await axios.post("/api/get-studies", {
          userId: userId,
        });
        return response.data;
      },
    });

    useEffect(() => {
      if (fetchLinkedChatQuery.data) {
        setStudies(fetchLinkedChatQuery.data);
        console.log("fetchLinkedChatQuery.data", fetchLinkedChatQuery.data);
      }
    }, [fetchLinkedChatQuery.data]);

    if (fetchLinkedChatQuery.isError) {
      console.error("Error fetching chat:", fetchLinkedChatQuery.error);
    }

    if (fetchLinkedChatQuery.isLoading) {
      return <div>Loading...</div>;
    }
  }

  return (
    <div className="left-sidebar-container h-screen bg-symbiont-foreground m-2 rounded-2xl ">
      <div className="mt-10 logo border-b-4 border-symbiont-800 flex flex-col items-center">
        <p className="text-xs uppercase font-semibold  tracking-widest">
          Symbiont
        </p>
      </div>
      <div className="navigation border-b-4 border-symbiont-800 flex">
        <div className="flex flex-col p-6">
          <NavItem icon={faHouse} text="Home" iconColorClass="#363A3D" />
          <NavItem icon={faBook} text="Library" iconColorClass="#363A3D" />
        </div>
      </div>

      <div className="projects-list border-symbiont-800">
        <h3 className="text-xs text-symbiont-textUnSelected uppercase m-4">
          Projects
        </h3>
        {studies.map((study) => (
          <div
            key={study.id}
            className="flex flex-row justify-between items-center p-4 cursor-pointer"
          >
            <Link
              href={`studies/${study.id}`}
              className="text-xs ml-2 capitalize"
            >
              {study.name}
            </Link>
          </div>
        ))}
      </div>
      <div className="settings p-2 flex flex-col flex-end">
        <OverLayGradient />
      </div>
    </div>
  );
};

export default LeftSideBarMain;
