"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { UserAuth } from "@/app/context/AuthContext";
import { useStudyContext } from "@/app/context/StudyContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Link,
  FileText,
  Video,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import useAddResourceRequest from "@/hooks/useAddResourceRequest";
import Session from "supertokens-auth-react/recipe/session";

type AuthHeaders = {
  Authorization: `Bearer ${string}`;
};

const AddResourcesModal = () => {
  const currentStudyContext = useStudyContext();
  const authContext = UserAuth();

  const [open, setOpen] = useState(false);
  const [webResources, setWebResources] = useState<string[]>([]);
  const [webLink, setWebLink] = useState("");
  const [textResourceName, setTextResourceName] = useState("");
  const [textResourceContent, setTextResourceContent] = useState("");
  const studyId = usePathname().split("/")[2];
  const [userToken, setUserToken] = useState<string | undefined>(undefined);
  const [ytLink, setYtLink] = useState("");

  const { resourceType, resourceStatus, mutation } = useAddResourceRequest();

  useEffect(() => {
    async function fetchAccessToken() {
      const accessToken = await Session.getAccessToken();
      if (accessToken) {
        setUserToken(accessToken);
      }
    }
    fetchAccessToken();
  }, [authContext]);

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 12500000) {
      alert("File is too big! Maximum size is 12.5MB");
      return;
    }

    const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/upload-resource?studyId=${studyId}`;
    const body = new FormData();
    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${userToken}`,
    };
    body.append("file", file);

    mutation.mutate({
      endpoint,
      body,
      headers,
      resourceType: file.type,
    });
  };

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

  // Close modal after successful upload
  useEffect(() => {
    if (mutation.isSuccess) {
      setTimeout(() => {
        setOpen(false);
      }, 2000); // Close after 2 seconds to show success message
    }
  }, [mutation.isSuccess]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Resources
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add sources</DialogTitle>
          <DialogDescription>
            Sources let your AI base its responses on the information that
            matters most to you. (Examples: PDFs, text documents, website links,
            YouTube videos, etc.)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Messages */}
          {resourceStatus.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {resourceStatus.error.message}: Failed to upload {resourceType}{" "}
                resource
              </AlertDescription>
            </Alert>
          )}

          {mutation.isSuccess && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {resourceType === "application/pdf" &&
                  "PDF uploaded successfully!"}
                {resourceType === "web" &&
                  "Website resource added successfully!"}
                {resourceType === "youtube" &&
                  "YouTube video added successfully!"}
                {resourceType === "text" && "Text resource added successfully!"}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload file
              </TabsTrigger>
              <TabsTrigger value="link" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Website
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="youtube" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                YouTube
              </TabsTrigger>
            </TabsList>

            {/* File Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload sources
                  </CardTitle>
                  <CardDescription>
                    Upload PDF, text, markdown, or audio files (max 12.5MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mutation.isPending &&
                  resourceType?.includes("application") ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Uploading file...</p>
                      <Progress value={undefined} className="w-full" />
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                      data-testid="file-upload-dropzone"
                    >
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500 font-medium">
                          Choose file
                        </span>
                        <span className="text-gray-600"> to upload</span>
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.txt,.md,.mp3,.wav,.m4a"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Supported file types: PDF, txt, Markdown, Audio (mp3,
                        wav, m4a)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Website Link Tab */}
            <TabsContent value="link" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Website
                  </CardTitle>
                  <CardDescription>
                    Add web pages to your sources
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mutation.isPending && resourceType === "web" ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Processing websites...
                      </p>
                      <Progress value={undefined} className="w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="web-links">Website URLs</Label>
                        <Textarea
                          id="web-links"
                          placeholder="Enter website URLs, one per line&#10;https://example.com&#10;https://another-site.com"
                          value={webLink}
                          onChange={(e) => setWebLink(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <Button
                        onClick={handleWebLinks}
                        disabled={!webLink.trim()}
                        className="w-full"
                      >
                        Add Websites
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Text Tab */}
            <TabsContent value="text" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Text
                  </CardTitle>
                  <CardDescription>Add text content directly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mutation.isPending && resourceType === "text" ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Saving text resource...
                      </p>
                      <Progress value={undefined} className="w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div
                        className="space-y-2"
                        data-testid="text-resource-name-input"
                      >
                        <Label htmlFor="text-name">Resource Name</Label>
                        <Input
                          id="text-name"
                          placeholder="Enter a name for this text resource"
                          value={textResourceName}
                          onChange={(e) => setTextResourceName(e.target.value)}
                        />
                      </div>
                      <div
                        className="space-y-2"
                        data-testid="text-resource-content-input"
                      >
                        <Label htmlFor="text-content">Text Content</Label>
                        <Textarea
                          id="text-content"
                          placeholder="Paste or type your text content here..."
                          value={textResourceContent}
                          onChange={(e) =>
                            setTextResourceContent(e.target.value)
                          }
                          rows={6}
                        />
                      </div>
                      <Button
                        onClick={handleTextResource}
                        disabled={
                          !textResourceName.trim() ||
                          !textResourceContent.trim()
                        }
                        className="w-full"
                        data-testid="add-text-resource-button"
                      >
                        Add Text Resource
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* YouTube Tab */}
            <TabsContent value="youtube" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    YouTube
                  </CardTitle>
                  <CardDescription>
                    Add YouTube videos to extract transcripts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mutation.isPending && resourceType === "youtube" ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Processing YouTube video...
                      </p>
                      <Progress value={undefined} className="w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="youtube-url">YouTube URL</Label>
                        <Input
                          id="youtube-url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={ytLink}
                          onChange={(e) => setYtLink(e.target.value)}
                          data-testid="youtube-url-input"
                        />
                      </div>
                      <Button
                        onClick={handleYtLinkSubmission}
                        disabled={!ytLink.trim()}
                        className="w-full"
                        data-testid="add-youtube-button"
                      >
                        Add YouTube Video
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddResourcesModal;
