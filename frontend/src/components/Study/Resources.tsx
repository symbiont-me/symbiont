// TODO this component is used to add resources to a study and should be refactored to be a dialog box
// TODO the Resources view should be a separate component that lists the resources being used
// TODO use Context to handle the state of the resources
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { UserAuth } from "@/app/context/AuthContext";
import { useStudyContext } from "@/app/context/StudyContext";
import { Container } from "@mui/material";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Alert } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import LinearProgress from "@mui/material/LinearProgress";
import useAddResourceRequest from "@/hooks/useAddResourceRequest";

// NOTE this component should not be part of the Study Nav as it is
// TODO should be refactored to make a dialog box where users can add and remove resources
// TODO add a separate component for the Study Navbar which lists the resources being used
import FileUpload from "@/components/ui/FileUpload";
// TODO handle audio file uploads using the FileUpload component
// TODO refactor to loop over an array of resources

type AuthHeaders = {
  Authorization: `Bearer ${string}`;
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

  const { resourceType, resourceStatus, mutation } = useAddResourceRequest();

  useEffect(() => {
    const getUserAuthToken = async () => {
      if (authContext?.user?.getIdToken) {
        const token = await authContext.user.getIdToken();
        setUserToken(token);
      }
    };
    getUserAuthToken();
  }, [authContext]);
  const authHeadersForRequests: AuthHeaders = {
    Authorization: `Bearer ${userToken}`,
  };

  const addResourceRequest = useAddResourceRequest();

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
    const links = webLink.split("\n").filter(isValidURL);
    setWebResources(links);
    if (userToken && webLink.length > 0) {
      const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/add-webpage-resource`;
      const body = {
        studyId,
        urls: links,
      };
      mutation.mutate({
        endpoint,
        body,
        headers: authHeadersForRequests,
        resourceType: "web",
      });
    }

    setWebLink(""); // Clear the input after adding
  }

  async function handleYtLinkSubmission() {
    if (userToken && ytLink.length > 0) {
      const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/add_yt_resource`;
      const body = {
        studyId,
        urls: [ytLink],
      };
      mutation.mutate({
        endpoint,
        body,
        headers: authHeadersForRequests,
        resourceType: "youtube",
      });
    }
    setYtLink(""); // Clear the input after adding
  }

  async function handleTextResource() {
    if (
      userToken &&
      textResourceName.length > 0 &&
      textResourceContent.length > 0
    ) {
      const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/add-plain-text-resource`;
      const body = {
        studyId,
        name: textResourceName,
        content: textResourceContent,
      };

      mutation.mutate({
        endpoint,
        body,
        headers: authHeadersForRequests,
        resourceType: "text",
      });
    }

    // reset the form
    setTextResourceName("");
    setTextResourceContent("");
  }

  return (
    <Container maxWidth="sm" className="overflow-hidden">
      {resourceType === "web" && resourceStatus.error ? (
        <Alert severity="error">
          {resourceStatus.error.message}: Failed to upload Web Resource
        </Alert>
      ) : resourceType === "web" && mutation.isSuccess ? (
        <Alert severity="success">
          <CheckIcon />
          Web Resource Uploaded Successfully
        </Alert>
      ) : resourceType === "youtube" && resourceStatus.error ? (
        <Alert severity="error">
          {resourceStatus.error.message}: Failed to upload Youtube Resource
        </Alert>
      ) : resourceType === "youtube" && mutation.isSuccess ? (
        <Alert severity="success">
          <CheckIcon />
          Youtube Resource Uploaded Successfully
        </Alert>
      ) : resourceType === "text" && resourceStatus.error ? (
        <Alert severity="error">
          {resourceStatus.error.message}: Failed to upload Text Resource
        </Alert>
      ) : resourceType === "text" && mutation.isSuccess ? (
        <Alert severity="success">
          <CheckIcon />
          Text Resource Uploaded Successfully
        </Alert>
      ) : null}

      <div className="mb-10">
        <FileUpload />
      </div>

      {/* WEB RESOURCE */}
      <div className="flex flex-col mb-4">
        {resourceType == "web" && mutation.isPending ? (
          <LinearProgress color="secondary" className="mb-2" />
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
            <Button variant="contained" onClick={handleWebLinks}>
              Add Webpages
            </Button>
          </>
        )}
      </div>

      {/* TEXT RESOURCE */}
      <div className="flex flex-col mb-4">
        {resourceType == "text" && mutation.isPending ? (
          <LinearProgress color="secondary" className="mb-2" />
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

            <Button variant="contained" onClick={handleTextResource}>
              Add Text Resource
            </Button>
          </>
        )}
      </div>

      {/* YOUTUBE LINK */}
      <div className="flex flex-col mb-4">
        {resourceType == "youtube" && mutation.isPending ? (
          <LinearProgress color="secondary" className="mb-2" />
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
            <Button variant="contained" onClick={handleYtLinkSubmission}>
              Add Youtube Link
            </Button>
          </>
        )}
      </div>
    </Container>
  );
};

export default Resources;
