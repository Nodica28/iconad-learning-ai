import React from "react";
import ChildDevelopmentForm from "../Forms/ChildDevForm";
import { Box } from "@mui/material";

const Home = () => {
  return (
    <Box
      sx={{
        p: {
          sm: 2,
          md: 5,
          lg: 10,
        },
      }}
    >
      <ChildDevelopmentForm />
    </Box>
  );
};

export default Home;
