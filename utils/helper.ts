import { company_type } from '../constants/Constant'; // Adjust the import path as needed

export const getCompanyTypeTitle = (value: string): string => {
    const company = company_type.find(item => item.value === value);
    return company ? company.title : "Unknown Type"; // Return a default title if not found
};