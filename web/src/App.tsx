import React from "react";
import { useState } from "react";
import "./App.css";
import Home from "./components/Pages/Home";
import Conversation from "./components/Pages/Conversation";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Home />
      <Conversation />
    </>
  );
}

export default App;
