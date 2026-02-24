"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

export const EcommerceMetrics = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">

      <div className="rounded-2xl border border-[var(--token-gray-200)] bg-[var(--token-white)] p-5 dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-[var(--token-gray-100)] rounded-xl dark:bg-[var(--color-surface-dark-subtle)]">
          <GroupIcon className="text-[var(--token-gray-800)] size-6 dark:text-[var(--token-white-90)]" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-[var(--token-gray-800)] text-title-sm dark:text-[var(--token-white-90)]">
              3,782
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            11.01%
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--token-gray-200)] bg-[var(--token-white)] p-5 dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-[var(--token-gray-100)] rounded-xl dark:bg-[var(--color-surface-dark-subtle)]">
          <BoxIconLine className="text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
              Orders
            </span>
            <h4 className="mt-2 font-bold text-[var(--token-gray-800)] text-title-sm dark:text-[var(--token-white-90)]">
              5,359
            </h4>
          </div>

          <Badge color="error">
            <ArrowDownIcon className="text-error-500" />
            9.05%
          </Badge>
        </div>
      </div>

    </div>
  );
};
