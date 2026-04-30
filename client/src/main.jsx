import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// 1. חובה לייבא את אלו מהספרייה שהתקנו!
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// 2. יצירת ה-Client
const queryClient = new QueryClient();

// 3. שים לב לשימוש ב-createRoot (בלי הקידומת ReactDOM)
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="top-center" />
    </QueryClientProvider>
  </StrictMode>,
);
