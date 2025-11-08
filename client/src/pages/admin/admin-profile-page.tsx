import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Input,
} from "@material-tailwind/react";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * AdminProfilePage
 * Compact, centered admin profile card.
 */
const AdminProfilePage: React.FC = () => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to save profile
    console.log({ name, email });
    alert(t("admin.profileSaved") || "Profile saved");
  };

  return (
    <div className="flex justify-center px-2 py-4 sm:px-4 lg:px-6">
      <Card className="w-full max-w-md bg-white border shadow-sm rounded-2xl border-blue-gray-50">
        <CardHeader
          shadow={false}
          floated={false}
          className="px-4 pt-4 pb-2 rounded-t-2xl"
        >
          <Typography variant="h6" color="blue-gray">
            {t("admin.profileSettings") || "Profile Settings"}
          </Typography>
          <Typography
            color="gray"
            className="mt-1 text-xs font-normal sm:text-sm"
          >
            {t("admin.profileSettingsDescription") ||
              "Update your admin profile information."}
          </Typography>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardBody className="px-4 pb-2 space-y-4">
            <Input
              label={t("admin.name") || "Name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="!text-sm"
              crossOrigin={undefined}
            />
            <Input
              label={t("admin.email") || "Email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="!text-sm"
              crossOrigin={undefined}
            />
          </CardBody>
          <CardFooter className="flex justify-end px-4 pt-0 pb-4">
            <Button
              type="submit"
              color="blue"
              size="sm"
              className="px-4 py-2 text-xs normal-case sm:text-sm"
            >
              {t("admin.save") || "Save"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminProfilePage;
