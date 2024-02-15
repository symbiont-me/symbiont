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
import { usePathname } from "next/navigation";
import "@/app/globals.css";
const LeftSideBarMain = () => {
  const authContext = UserAuth();
  const userId = authContext?.user?.uid;
  const [studies, setStudies] = useState<Study[]>([]);
  const pathname = usePathname();
  const studyId = pathname.split("/")[2];

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
      <div
        className="mt-10 logo flex flex-col items-center"
        style={{ borderBottom: "2px solid #292927" }}
      >
        <p className="text-xs uppercase font-semibold  tracking-widest">
          Symbiont
        </p>
      </div>
      <div
        className="navigation flex"
        style={{ borderBottom: "2px solid #292927" }}
      >
        <div className="flex flex-col p-6">
          <NavItem icon={faHouse} text="Home" iconColor="#46CDAF" />
          <NavItem icon={faBook} text="Library" iconColor="#363A3D" />
        </div>
      </div>

      <div className="projects-list border-symbiont-800">
        <h3 className="text-xs text-symbiont-textUnSelected uppercase m-4">
          Projects
        </h3>
        {studies.map((study) => (
          <Link
            href={`studies/${study.id}`}
            key={study.id}
            className="flex flex-col items-start p-4 cursor-pointer bg-symbiont-foreground hover:bg-symbiont-800 rounded-2xl m-2"
          >
            {study.id?.toString() === studyId ? (
              <div>
                <p className="text-xs ml-2 capitalize">{study.name}</p>
                <div
                  className="h-2 w-full selected-gradient rounded-full"
                  style={{ margin: "5px" }}
                ></div>
              </div>
            ) : (
              <p className="text-xs ml-2 capitalize">{study.name}</p>
            )}
          </Link>
        ))}
      </div>
      <div className="settings p-2 flex flex-col justify-end">
        <OverLayGradient />
      </div>
    </div>
  );
};

export default LeftSideBarMain;
