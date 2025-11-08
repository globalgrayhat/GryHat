/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAllCategories } from "../../api/endpoints/category";
import type { ApiResponseCategory } from "../../api/types/apiResponses/api-response-category";
import Select from "react-select";

interface Props {
  handleSelect: (value: string) => void;
}

const FilterInstructorSelectBox: React.FC<Props> = ({ handleSelect }) => {
  const [categories, setCategories] = useState<ApiResponseCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllCategories = async () => {
    try {
      setLoading(true);
      const response = await getAllCategories();
      const data = response?.data?.data || response?.data || [];
      if (Array.isArray(data)) setCategories(data);
    } catch {
      toast.error("Something went wrong", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const handleSelectChange = (selectedOption: any) => {
    handleSelect(selectedOption?.value || "");
  };

  if (!categories.length && !loading) return null;

  return (
    <Select
      className="w-full basic-single md:w-1/2 lg:w-1/3"
      classNamePrefix="select"
      isLoading={loading}
      isClearable
      isSearchable
      name="category"
      onChange={handleSelectChange}
      placeholder="Filter by category..."
      options={categories.map((category) => ({
        value: category?.name,
        label: category?.name,
      }))}
    />
  );
};

export default FilterInstructorSelectBox;
