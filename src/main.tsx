import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";

const container = document.getElementById("root")! as HTMLElement;
const root = ReactDOM.createRoot(container);

root.render(<App />);