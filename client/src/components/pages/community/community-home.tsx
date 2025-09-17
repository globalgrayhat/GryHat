<<<<<<< HEAD
import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";

const CommunityHome: React.FC = () => {
  const { t, lang } = useLanguage() as { t: (k: string) => string; lang?: "ar" | "en" };

  return (
    <section
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors py-10"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-xl rounded-2xl ring-1 ring-gray-200 bg-white shadow-sm p-6 md:p-8 dark:ring-gray-700 dark:bg-gray-900">
          <h1 className="text-2xl md:text-3xl font-bold">
            {t("community.comingSoon.title") || "Coming Soon!"}
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
            {t("community.comingSoon.line1") ||
              "We're working on creating an awesome community for you."}
          </p>
          <p className="mt-1 text-sm md:text-base text-gray-700 dark:text-gray-300">
            {t("community.comingSoon.line2") ||
              "Stay tuned for updates and exciting features!"}
          </p>
        </div>
      </div>
    </section>
  );
=======
import React from 'react';

const CommunityHome: React.FC = () => {
  return (
    <div className="flex items-start justify-center min-h-screen  mt-5 ">
      <div className="bg-white mt-5 p-8 rounded-lg">
        <h1 className="text-2xl font-semibold mb-4">Coming Soon!</h1>
        <p className="text-gray-600">We're working on creating an awesome community for you.</p>
        <p className="text-gray-600">Stay tuned for updates and exciting features!</p>
      </div>
    </div>
  );  
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
};

export default CommunityHome;
