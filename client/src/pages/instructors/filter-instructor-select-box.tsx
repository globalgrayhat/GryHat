/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAllCategories } from "../../api/endpoints/category";
import type { ApiResponseCategory } from "../../api/types/apiResponses/api-response-category";
import Select from "react-select";

interface Props {
  handleSelect: (value: string) => void;
}

const FilterInstructorSelectBox: React.FC<Props> = ({ handleSelect }) => {
  const [categories, setCategories] = useState<ApiResponseCategory[] | null>(null);

  const fetchAllCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response?.data);
    } catch (error) {
      toast.error("Something went wrong", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const handleSelectChange = (selectedOption: any) => {
    handleSelect(selectedOption?.value || "");
  };

  return (
    <>
      {categories && (
        <Select
          // Responsive width: full width on small screens, half on medium and up
          className='basic-single w-full md:w-1/2 lg:w-1/3'
          classNamePrefix='select'
          defaultValue={null}
          isLoading={false}
          isClearable={true}
          isSearchable={true}
          name='color'
          onChange={handleSelectChange}
          placeholder='Filter by category...'
          options={categories.map((category) => ({
            value: category?.name,
            label: category?.name,
          }))}
        />
      )}
    </>
  );
};

export default FilterInstructorSelectBox;