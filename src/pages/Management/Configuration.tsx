import React from "react";
import { Link } from "react-router";
import Button from "@/components/ui/button/Button";

const Configuration: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Configuration
      </h1>

      <div className="flex flex-col gap-4 max-w-xl">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center justify-between gap-3">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              Payment Types
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Fitra and General (Zakat / Sadaqah)
            </div>
          </div>
          <Link to="/configuration/payment-types">
            <Button size="sm">Open</Button>
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center justify-between gap-3">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              Ramadan Configuration
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Ramadan-specific settings
            </div>
          </div>
          <Link to="/configuration/ramadan">
            <Button size="sm">Open</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
