import { createRoot } from "react-dom/client";
import App from "./components/App.tsx";
import "../css/app.css";

const rootElement = document.getElementById("app");
if (rootElement) {
    createRoot(rootElement).render(<App />);
}