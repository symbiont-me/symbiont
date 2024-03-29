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
import CircularProgress from "@mui/material/CircularProgress";
import { Alert } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

async function addTextResource(
  studyId: string,
  name: string,
  content: string,
  userToken: string
) {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BASE_URL}/add-plain-text-resource`,
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

  const authContext = UserAuth();

  const [webResources, setWebResources] = useState<string[]>([]);
  const [webLink, setWebLink] = useState("");
  const [textResourceName, setTextResourceName] = useState("");
  const [textResourceContent, setTextResourceContent] = useState("");
  const studyId = usePathname().split("/")[2];
  const [userToken, setUserToken] = useState<string | undefined>(undefined);
  const [ytLink, setYtLink] = useState("");
  const [isWebResourceLoading, setIsWebResourceLoading] = useState(false);
  const [isTextResourceLoading, setIsTextResourceLoading] = useState(false);
  const [isYtResourceLoading, setIsYtResourceLoading] = useState(false);

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

  if (!currentStudyContext) {
    return null;
  }
  const isValidURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  async function handleWebLinks() {
    setIsWebResourceLoading(true);
    const links = webLink.split("\n").filter(isValidURL);
    setWebResources(links);
    if (userToken && webLink.length > 0) {
      await currentStudyContext?.uploadWebResource(studyId, links);
      setIsWebResourceLoading(false);
    } else {
      setIsWebResourceLoading(false);
    }
    setWebLink(""); // Clear the input after adding
  }

  function handleTextResource() {
    setIsTextResourceLoading(true);
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
      ).then(() => {
        setIsTextResourceLoading(false);
      });
    } else {
      setIsTextResourceLoading(false);
    }

    setTextResourceName("");
    setTextResourceContent("");
  }

  async function handleYtLinkSubmission() {
    setIsYtResourceLoading(true);
    if (userToken && ytLink.length > 0) {
      await currentStudyContext?.uploadYtResource(studyId, ytLink);
    }
    setIsYtResourceLoading(false);
    setYtLink("");
  }

  return (
    <Container maxWidth="sm">
      {currentStudyContext.isStudyLoading ? (
        <Alert severity="info">Uploading Resource</Alert>
      ) : currentStudyContext.isSuccess ? (
        <Alert severity="success">
          <CheckIcon />
          Resource Uploaded Successfully
        </Alert>
      ) : currentStudyContext.studyError ? (
        <Alert severity="error">
          Error Uploading Resource. Please try again
        </Alert>
      ) : null}
      <div className="mb-10">
        <FileUpload />
      </div>
      {/* WEB RESOURCE */}

      {/* WEB RESOURCE */}
      <div className="flex flex-col mb-4">
        {isWebResourceLoading ? (
          <CircularProgress />
        ) : (
          <>
            <TextField
              id="outlined-textarea"
              label="Add Web Resource"
              placeholder="Webpages separated by newlines"
              multiline
              value={webLink}
              onChange={(e) => setWebLink(e.target.value)}
              className="mb-2"
            />
            <Button
              variant="contained"
              onClick={handleWebLinks}
              disabled={isWebResourceLoading}
            >
              Add Webpages
            </Button>
          </>
        )}
      </div>

      {/* TEXT RESOURCE */}
      <div className="flex flex-col mb-4">
        {isTextResourceLoading ? (
          <CircularProgress />
        ) : (
          <>
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

            <Button
              variant="contained"
              onClick={handleTextResource}
              disabled={isTextResourceLoading}
            >
              Add Text Resource
            </Button>
          </>
        )}
      </div>

      {/* YOUTUBE LINK */}
      <div className="flex flex-col mb-4">
        {isYtResourceLoading ? (
          <CircularProgress />
        ) : (
          <>
            <TextField
              id="standard-basic"
              label="Add Youtube Link"
              variant="standard"
              type="text"
              value={ytLink}
              onChange={(e) => setYtLink(e.target.value)}
              className="mb-2"
            />
            <Button
              variant="contained"
              onClick={handleYtLinkSubmission}
              disabled={isYtResourceLoading}
            >
              Add Youtube Link
            </Button>
          </>
        )}
      </div>
    </Container>
  );
};

export default Resources;
