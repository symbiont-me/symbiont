import { useState } from "react";

const AddResourcesModal = () => {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [webpage, setWebpage] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "youtubeLink") {
      setYoutubeLink(value);
    } else if (name === "webpage") {
      setWebpage(value);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission logic here
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="YouTube Link"
          name="youtubeLink"
          value={youtubeLink}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Webpage"
          name="webpage"
          value={webpage}
          onChange={handleInputChange}
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default AddResourcesModal;
