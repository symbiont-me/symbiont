import React from "react";
import { CircularProgress } from "@mui/material";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center justify-center">
        <CircularProgress color="secondary" />
      </div>
    </div>
  );
};

export default Loader;
