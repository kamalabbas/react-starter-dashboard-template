import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { restoreUser } from "./utility/restoreUser";

const queryClient = new QueryClient();

async function start() {
  try {
    await restoreUser();
  } catch (err) {
    console.error("Failed to restore user on startup:", err);
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  );
}

void start();
