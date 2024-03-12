// TODO this component is used to add resources to a study and should be refactored to be a dialog box
// TODO the Resources view should be a separate component that lists the resources being used

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import { UserAuth } from "@/app/context/AuthContext";
import { useStudyContext } from "@/app/context/StudyContext";

// TODO use Hooks
async function addWebResource(
  studyId: string,
  urls: string[],
  userToken: string
) {
  const response = await axios.post(
    `http://127.0.0.1:8000/add-webpage-resource`,
    {
      studyId: studyId,
      urls: urls,
    },

    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return response;
}

async function addTextResource(
  studyId: string,
  name: string,
  content: string,
  userToken: string
) {
  const response = await axios.post(
    `http://127.0.0.1:8000/add-plain-text-resource`,
    { studyId: studyId, name: name, content: content },
    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return response;
}

// NOTE this component should not be part of the Study Nav as it is
// TODO should be refactored to make a dialog box where users can add and remove resources
// TODO add a separate component for the Study Navbar which lists the resources being used
import FileUpload from "@/components/ui/FileUpload";
// TODO handle audio file uploads using the FileUpload component
// TODO refactor to loop over an array of resources
type TextResource = {
  name: string;
  content: string;
};
const Resources = () => {
  const currentStudyContext = useStudyContext();
  if (!currentStudyContext) {
    return null;
  }
  const authContext = UserAuth();

  const [webResources, setWebResources] = useState<string[]>([]);
  const [webLink, setWebLink] = useState("");
  const [textResourceName, setTextResourceName] = useState("");
  const [textResourceContent, setTextResourceContent] = useState("");
  const studyId = usePathname().split("/")[2];
  const [userToken, setUserToken] = useState<string | undefined>(undefined);
  const [ytLink, setYtLink] = useState("");

  // TODO remove as not needed because of the useStudyContext hook
  useEffect(() => {
    const getUserAuthToken = async () => {
      if (authContext?.user?.getIdToken) {
        const token = await authContext.user.getIdToken();
        setUserToken(token);
      }
    };
    getUserAuthToken();
  }, [authContext]);

  const isValidURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  function handleWebLinks() {
    const links = webLink.split("\n").filter(isValidURL);
    setWebResources(links);
    if (userToken && webLink.length > 0) {
      addWebResource(studyId, links, userToken);
    }
    setWebLink(""); // Clear the input after adding
  }

  function handleTextResource() {
    if (
      userToken &&
      textResourceName.length > 0 &&
      textResourceContent.length > 0
    ) {
      addTextResource(
        studyId,
        textResourceName,
        textResourceContent,
        userToken
      );
    }

    setTextResourceName("");
    setTextResourceContent("");
  }

  async function handleYtLinkSubmission() {
    if (userToken && ytLink.length > 0) {
      currentStudyContext?.uploadYtResource(studyId, ytLink);
    }
    setYtLink("");
  }

  return (
    <div className="flex flex-col justify-start items-start">
      <div className="mb-10">
        <FileUpload />
      </div>
      <textarea
        value={webLink}
        onChange={(e) => setWebLink(e.target.value)}
        placeholder="Add Webpage Links separated by next line: https://www.google.com https://www.facebook.com"
        className="input input-bordered w-full max-w-xs mb-4 px-2 py-1"
      />
      <button className="btn btn-primary mb-10" onClick={handleWebLinks}>
        Add Webpages
      </button>
      <div className="flex flex-col">
        <input
          type="text"
          value={textResourceName}
          onChange={(e) => setTextResourceName(e.target.value)}
          placeholder="Add Text Resource Name"
          className="input input-bordered w-full max-w-xs mb-4"
        />
        <textarea
          value={textResourceContent}
          onChange={(e) => setTextResourceContent(e.target.value)}
          placeholder="Add Text Resource"
          className="input input-bordered w-full max-w-xs mb-4 px-2 py-1"
        />
        <button className="btn btn-primary mb-10" onClick={handleTextResource}>
          Add Text Resource
        </button>
      </div>

      {/* YOUTUBE LINK */}
      <input
        type="text"
        value={ytLink}
        onChange={(e) => setYtLink(e.target.value)}
        placeholder="Add Youtube Link"
        className="input input-bordered w-full max-w-xs mb-4"
      />
      <button
        className="btn btn-primary mb-10"
        onClick={handleYtLinkSubmission}
      >
        Add Youtube Link
      </button>
    </div>
  );
};

export default Resources;
