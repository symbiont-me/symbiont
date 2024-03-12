// TODO this component is used to add resources to a study and should be refactored to be a dialog box
// TODO the Resources view should be a separate component that lists the resources being used
// TODO use Context to handle the state of the resources
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import { UserAuth } from "@/app/context/AuthContext";
import { useStudyContext } from "@/app/context/StudyContext";
import { Container } from "@mui/material";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
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
    // TODO handle validation
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
    <Container maxWidth="sm">
      <div className="mb-10">
        <FileUpload />
      </div>
      <div className="flex flex-col mb-4">
        <TextField
          id="outlined-textarea"
          label="Add Web Resource"
          placeholder="Webpages separated by newlines"
          multiline
          value={webLink}
          onChange={(e) => setWebLink(e.target.value)}
          className="mb-2"
        />
        <Button variant="contained" onClick={handleWebLinks}>
          Add Webpages
        </Button>
      </div>
      <div className="flex flex-col mb-4">
        <TextField
          id="outlined-textarea"
          label="Add Text Resource"
          placeholder="Multiline Text"
          multiline
          value={textResourceContent}
          onChange={(e) => setTextResourceContent(e.target.value)}
          className="mb-2"
        />

        <TextField
          id="standard-basic"
          label="Text Resource Name"
          variant="standard"
          type="text"
          value={textResourceName}
          onChange={(e) => setTextResourceName(e.target.value)}
          className="mb-2"
        />

        <Button variant="contained" onClick={handleTextResource}>
          Add Text Resource
        </Button>
      </div>

      {/* YOUTUBE LINK */}
      <div className="flex flex-col mb-4">
        <TextField
          id="standard-basic"
          label="Add Youtube Link"
          variant="standard"
          type="text"
          value={ytLink}
          onChange={(e) => setYtLink(e.target.value)}
          className="mb-2"
        />
        <Button variant="contained" onClick={handleYtLinkSubmission}>
          Add Youtube Link
        </Button>
      </div>
    </Container>
  );
};

export default Resources;
