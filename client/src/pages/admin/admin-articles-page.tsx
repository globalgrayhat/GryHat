import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Typography,
  Input,
} from "@material-tailwind/react";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * AdminArticlesPage
 * Responsive & compact layout for managing articles.
 */
const AdminArticlesPage: React.FC = () => {
  const { t } = useLanguage();

  const articles = [
    {
      _id: "1",
      title: "What is Machine Learning?",
      author: "Admin",
      date: "2025-01-20",
    },
    {
      _id: "2",
      title: "Building a Modern Web App",
      author: "Admin",
      date: "2025-02-10",
    },
  ];

  return (
    <div className="px-2 py-4 sm:px-4 lg:px-6">
      <Typography
        variant="h5"
        className="mb-3 font-semibold text-blue-gray-900"
      >
        {t("admin.articles") || "Articles"}
      </Typography>

      <Card className="w-full bg-white border shadow-sm rounded-2xl border-blue-gray-50">
        <CardHeader
          floated={false}
          shadow={false}
          className="px-3 py-3 border-b rounded-none sm:px-4 lg:px-6 border-blue-gray-50"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <Typography variant="h6" className="text-blue-gray-900">
                {t("admin.articles") || "Articles"}
              </Typography>
              <Typography
                color="gray"
                className="text-xs font-normal sm:text-sm"
              >
                {t("admin.articlesDescription") ||
                  "Manage platform articles and editorial content."}
              </Typography>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <div className="flex-1 min-w-[140px]">
                <Input
                  label={t("admin.search") || "Search"}
                  className="!text-sm"
                  crossOrigin={undefined}
                />
              </div>
              <Button
                size="sm"
                color="blue"
                className="px-3 py-2 text-xs normal-case whitespace-nowrap sm:text-sm"
              >
                {t("common.add") || "Add"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-0 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t("article.title") || "Title"}
                </th>
                <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t("article.author") || "Author"}
                </th>
                <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t("article.date") || "Published"}
                </th>
                <th className="px-4 py-3 sm:px-6" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <tr
                    key={article._id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-xs font-medium text-gray-900 sm:px-6 whitespace-nowrap sm:text-sm">
                      {article.title}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-[11px] sm:text-sm text-gray-600">
                      {article.author}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-[11px] sm:text-sm text-gray-600">
                      {article.date}
                    </td>
                    <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outlined"
                          color="blue"
                          className="px-2 py-1 text-[10px] sm:text-xs normal-case"
                        >
                          {t("common.edit") || "Edit"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outlined"
                          color="red"
                          className="px-2 py-1 text-[10px] sm:text-xs normal-case"
                        >
                          {t("common.delete") || "Delete"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-xs text-center text-gray-500 sm:px-6 sm:text-sm"
                  >
                    {t("admin.noArticles") || "No articles found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>

        <CardFooter className="flex items-center justify-end gap-2 px-4 py-3 border-t sm:px-6 border-blue-gray-50">
          <Button
            size="sm"
            variant="outlined"
            color="blue"
            className="px-2 py-1 text-[10px] sm:text-xs normal-case"
          >
            {t("common.previous") || "Previous"}
          </Button>
          <Button
            size="sm"
            variant="outlined"
            color="blue"
            className="px-2 py-1 text-[10px] sm:text-xs normal-case"
          >
            {t("common.next") || "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminArticlesPage;
