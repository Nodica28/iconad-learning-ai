import React from "react";
import { Box, CircularProgress } from "@mui/material";

const LoadingSpinner = () => {
  return (
    <Box display={"flex"} justifyContent={"center"} alignItems={"center"}>
      <CircularProgress size={25} style={{ color: "white" }} />
    </Box>
  );
};

export default LoadingSpinner;
