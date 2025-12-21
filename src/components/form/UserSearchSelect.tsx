import React, { useEffect, useMemo, useRef, useState } from "react";
import { GenderCode } from "@/interface/enums";
import { useSearchUsers, UserSearch } from "@/hooks/useSearchUsers";

type Props = {
  label?: string;
  value?: string | number | null;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  gender: GenderCode;
  disabled?: boolean;
  initialLabel?: string;
  civilFamilyNumber?: string;
};

const UserSearchSelect: React.FC<Props> = ({
  label,
  value,
  onChange,
  placeholder = "Search user...",
  error,
  gender,
  disabled,
  initialLabel,
  civilFamilyNumber,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const debounceRef = useRef<number | null>(null);

  const { data, isFetching, refetch } = useSearchUsers(String(searchQuery || ""), gender, civilFamilyNumber);

  const results: UserSearch[] = useMemo(() => data?.data?.userList ?? [], [data?.data?.userList]);

  // Seed label for edit mode
  useEffect(() => {
    if (initialLabel) setSelectedLabel(initialLabel);
  }, [initialLabel]);

  // If we have results, sync label to the currently-selected id
  useEffect(() => {
    const v = value == null ? "" : String(value);
    if (!v) return;
    const found = results.find((u) => String(u.userId) === v);
    if (found?.fullName) setSelectedLabel(found.fullName);
  }, [value, results]);

  // Debounced search while typing
  useEffect(() => {
    if (disabled) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    const q = searchQuery.trim();

    if (q.length < 2) {
      setOpen(false);
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      setOpen(true);
      refetch();
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchQuery, refetch, disabled]);

  const inputValue = isFocused ? searchQuery : selectedLabel;

  return (
    <div className="w-full">
      {label ? <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{label}</label> : null}

      <div className="relative">
        <input
          value={inputValue}
          disabled={!!disabled}
          placeholder={placeholder}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          onFocus={() => {
            if (disabled) return;
            setIsFocused(true);
            setSearchQuery("");
          }}
          onBlur={() => {
            // allow click on list items
            window.setTimeout(() => setOpen(false), 150);
            setIsFocused(false);
            setSearchQuery("");
          }}
          className={`h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
            disabled ? "cursor-not-allowed opacity-60" : ""
          }`}
        />

        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </span>

        {open && !disabled && (
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
              {isFetching ? "Searching..." : results.length ? "Select a user" : "No users found"}
            </div>
            {results.length > 0 && (
              <ul className="max-h-64 overflow-auto">
                {results.map((u) => (
                  <li
                    key={u.userId}
                    className="cursor-pointer px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedLabel(u.fullName);
                      onChange(String(u.userId));
                      setOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    {u.fullName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {error ? <p className="text-error-500 text-xs mt-1">{error}</p> : null}
    </div>
  );
};

export default UserSearchSelect;
