import React, { useMemo, useState } from "react";
import {
  Button,
  Input,
  Typography,
  Chip,
} from "@material-tailwind/react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import AdminTable, {
  type AdminTableColumn,
} from "../../components/admin/AdminTable";

interface AdminArticle {
  _id: string;
  title: string;
  author: string;
  date: string;
  status?: "draft" | "published";
}

const MOCK_ARTICLES: AdminArticle[] = [
  {
    _id: "1",
    title: "What is Machine Learning?",
    author: "Admin",
    date: "2025-01-20",
    status: "published",
  },
  {
    _id: "2",
    title: "Building a Modern Web App",
    author: "Admin",
    date: "2025-02-10",
    status: "draft",
  },
];

const AdminArticlesPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const articles = MOCK_ARTICLES;

  const filtered = useMemo(
    () =>
      articles.filter((a) =>
        `${a.title} ${a.author}`
          .toLowerCase()
          .includes(search.toLowerCase().trim())
      ),
    [articles, search]
  );

  const columns: AdminTableColumn[] = [
    { key: "title", label: t("article.title") || "Title" },
    { key: "author", label: t("article.author") || "Author" },
    { key: "date", label: t("article.date") || "Published", align: "center" },
    { key: "status", label: t("article.status") || "Status", align: "center" },
    { key: "actions", label: "", align: "right", width: "140px" },
  ];

  const handleEdit = (id: string) => {
    // جهز route مستقبلاً مثل: /admin/articles/:id
    navigate(`/admin/articles/${id}`, { replace: false });
  };

  const handleDelete = (id: string) => {
    // هنا لاحقاً تربط مع API
    // مؤقتاً:
    console.log("Delete article", id);
  };

  return (
    <AdminPageLayout
      title={t("admin.articles") || "Articles"}
      description={
        t("admin.articlesDescription") ||
        "Manage platform articles and editorial content."
      }
      actions={
        <>
          <div className="hidden sm:block w-52">
            <Input
              label={t("admin.search") || "Search"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!text-xs"
              crossOrigin={undefined}
            />
          </div>
          <Button
            size="sm"
            color="indigo"
            className="px-3 py-2 text-[10px] sm:text-xs normal-case rounded-xl"
            onClick={() => navigate("/admin/articles/create")}
          >
            {t("common.add") || "Add Article"}
          </Button>
        </>
      }
    >
      {/* Search mobile */}
      <div className="mb-2 sm:hidden">
        <Input
          label={t("admin.search") || "Search"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="!text-xs"
          crossOrigin={undefined}
        />
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        emptyMessage={t("admin.noArticles") || "No articles found."}
        renderRow={(article, index) => {
          const statusColor =
            article.status === "published"
              ? "green"
              : article.status === "draft"
              ? "amber"
              : "blue-gray";

          return (
            <tr
              key={article._id || index}
              className="transition-colors hover:bg-blue-gray-50/40"
            >
              <td className="px-3 py-3 sm:px-4">
                <Typography className="text-[11px] sm:text-xs font-semibold text-blue-gray-900">
                  {article.title}
                </Typography>
              </td>
              <td className="px-3 py-3 sm:px-4">
                <Typography className="text-[10px] text-gray-700">
                  {article.author}
                </Typography>
              </td>
              <td className="px-3 py-3 text-center sm:px-4">
                <Typography className="text-[10px] text-gray-700">
                  {article.date}
                </Typography>
              </td>
              <td className="px-3 py-3 text-center sm:px-4">
                <Chip
                  size="sm"
                  variant="ghost"
                  color={statusColor}
                  value={
                    article.status === "published"
                      ? t("article.published") || "Published"
                      : article.status === "draft"
                      ? t("article.draft") || "Draft"
                      : "-"
                  }
                  className="px-2 py-0.5 text-[9px]"
                />
              </td>
              <td className="px-3 py-3 sm:px-4">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outlined"
                    color="indigo"
                    className="px-2 py-1 text-[9px] sm:text-[10px] normal-case rounded-lg"
                    onClick={() => handleEdit(article._id)}
                  >
                    {t("common.edit") || "Edit"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="red"
                    className="px-2 py-1 text-[9px] sm:text-[10px] normal-case rounded-lg"
                    onClick={() => handleDelete(article._id)}
                  >
                    {t("common.delete") || "Delete"}
                  </Button>
                </div>
              </td>
            </tr>
          );
        }}
      />
    </AdminPageLayout>
  );
};

export default AdminArticlesPage;
