import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { MetaContextProvider } from "./hooks/useMeta.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MetaContextProvider>
      <App />
    </MetaContextProvider>
  </React.StrictMode>
);
