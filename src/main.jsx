import { createRoot } from "react-dom/client";
import "./index.css";
import "./css/CustomStyle.css";
import App from "./App.jsx";
import axios from "axios";
import { ThemeProvider } from "./components/ThemeProvider";

axios.defaults.baseURL = "http://127.0.0.1:8000";

createRoot(document.getElementById("root")).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="dark"
    enableSystem
    disableTransitionOnChange
    storageKey="vite-ui-theme"
  >
    <App />
  </ThemeProvider>
);
