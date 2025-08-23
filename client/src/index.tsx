import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppRouter from "./routes";
import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { store,persistor } from "./redux/store";
// Material Tailwind theme provider handles component theming and tokens
import { ThemeProvider as MaterialThemeProvider } from "@material-tailwind/react";
// Our application theme provider toggles dark/light mode
import { ThemeProvider as AppThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import { ToastContainer } from "react-toastify";
import Modal from "react-modal";
import CONFIG_KEYS from "./config";
import { PersistGate } from "redux-persist/integration/react";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
Modal.setAppElement("#root");

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={CONFIG_KEYS.GOOGLE_AUTH_CLIENT_ID}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {/* Provide site settings and language contexts before theme so translations and settings are available globally */}
          <SiteSettingsProvider>
            <LanguageProvider>
              {/* Our AppThemeProvider toggles dark/light mode by adding `dark` class to the root */}
              <AppThemeProvider>
                {/* Material Tailwind theme provider provides design tokens */}
                <MaterialThemeProvider>
                  <RouterProvider router={AppRouter} />
                  <ToastContainer />
                </MaterialThemeProvider>
              </AppThemeProvider>
            </LanguageProvider>
          </SiteSettingsProvider>
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
