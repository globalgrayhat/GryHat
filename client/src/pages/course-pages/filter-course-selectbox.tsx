import React, { useEffect, useMemo, useState } from "react";
import Select, { SingleValue, ActionMeta, StylesConfig } from "react-select";
import makeAnimated from "react-select/animated";
import { getAllCategories } from "../../api/endpoints/category";
import { ApiResponseCategory } from "../../api/types/apiResponses/api-response-category";
import { toast } from "react-toastify";
import { useLanguage } from "../../contexts/LanguageContext";

const animatedComponents = makeAnimated();

type Option = { value: string; label: string };

interface Props {
  handleSelect: (value: string) => void;
}

const useIsDark = () => {
  const [isDark, setIsDark] = useState<boolean>(
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false
  );

  useEffect(() => {
    if (typeof MutationObserver === "undefined") return;
    const root = document.documentElement;
    const obs = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return isDark;
};

const FilterCourseSelectBox: React.FC<Props> = ({ handleSelect }) => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<ApiResponseCategory[] | null>(null);
  const isDark = useIsDark();

  const fetchAllCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response?.data);
    } catch {
      toast.error("Something went wrong", { position: toast.POSITION.BOTTOM_RIGHT });
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const handleSelectChange = (selected: SingleValue<Option>, _meta?: ActionMeta<Option>) => {
    handleSelect(selected?.value || "");
  };

  // react-select theme-aware styles
  const styles = useMemo<StylesConfig<Option, false>>(
    () => ({
      control: (base, state) => ({
        ...base,
        minHeight: 40,
        borderRadius: 10,
        backgroundColor: isDark ? "#111827" : "#ffffff",
        borderColor: state.isFocused ? (isDark ? "#3b82f6" : "#60a5fa") : isDark ? "#374151" : "#d1d5db",
        boxShadow: state.isFocused ? (isDark ? "0 0 0 3px rgba(59,130,246,.3)" : "0 0 0 3px rgba(59,130,246,.2)") : "none",
        ":hover": {
          borderColor: state.isFocused ? (isDark ? "#3b82f6" : "#60a5fa") : isDark ? "#4b5563" : "#cbd5e1",
        },
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
        borderRadius: 12,
        overflow: "hidden",
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? (isDark ? "#1f2937" : "#f1f5f9") : isDark ? "#0f172a" : "#ffffff",
        color: isDark ? "#e5e7eb" : "#111827",
        cursor: "pointer",
      }),
      singleValue: (base) => ({
        ...base,
        color: isDark ? "#e5e7eb" : "#111827",
      }),
      placeholder: (base) => ({
        ...base,
        color: isDark ? "#9ca3af" : "#6b7280",
      }),
      input: (base) => ({
        ...base,
        color: isDark ? "#e5e7eb" : "#111827",
      }),
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      indicatorSeparator: (base) => ({ ...base, display: "none" }),
      dropdownIndicator: (base) => ({ ...base, color: isDark ? "#9ca3af" : "#4b5563" }),
      clearIndicator: (base) => ({ ...base, color: isDark ? "#9ca3af" : "#4b5563" }),
      valueContainer: (base) => ({ ...base, paddingLeft: 12, paddingRight: 8 }),
    }),
    [isDark]
  );

  return (
    <div className="w-full sm:max-w-md">
      <Select<Option, false>
        className="react-select w-full"
        classNamePrefix="select"
        styles={styles}
        components={animatedComponents}
        placeholder={t("filters.categoriesPlaceholder") || "Filter by categories"}
        noOptionsMessage={() => t("filters.noOptions") || "No options"}
        onChange={handleSelectChange}
        isClearable
        isSearchable
        options={(categories || []).map((c) => ({
          value: c?.name,
          label: c?.name,
        }))}
      />
    </div>
  );
};

export default FilterCourseSelectBox;
