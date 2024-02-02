// NOTE this component should not be part of the Study Nav as it is
// TODO should be refactored to make a dialog box where users can add and remove resources
// TODO add a separate component for the Study Navbar which lists the resources being used
import FileUpload from "@/components/ui/FileUpload";
import { useState } from "react";
// TODO handle audio file uploads using the FileUpload component
// TODO refactor to loop over an array of resources
export default function Resources() {
  // TODO handle state changes for each resource type
  // TODO send resource data to backend and update db

  return (
    <div>
      {/* PDF Uploader or Link */}
      <FileUpload />
      {/* Webpage link */}
      {/* TODO should be a textarea for multiple links */}
      <input
        type="text"
        placeholder="Add Webpage Links"
        className="input input-bordered w-full max-w-xs"
      />
      {/* Youtube link */}
      <input
        type="text"
        placeholder="Add YouTube link"
        className="input input-bordered w-full max-w-xs"
      />
      {/* Audio link or Upload */}
      <input
        type="text"
        placeholder="Add audio link"
        className="input input-bordered w-full max-w-xs"
      />
    </div>
  );
}
