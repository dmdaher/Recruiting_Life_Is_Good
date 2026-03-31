"use client";

import { useState } from "react";
import { CreateReqModal } from "./CreateReqModal";

type Props = {
  departments: { id: string; code: string; name: string }[];
  locations: { id: string; name: string; country: string }[];
  users: { id: string; name: string; role: string }[];
};

export function NewReqButton({ departments, locations, users }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2.5 bg-denali-cyan text-denali-black font-medium rounded-lg hover:bg-denali-cyan/90 transition-colors text-sm"
      >
        + New Requisition
      </button>

      {open && (
        <CreateReqModal
          departments={departments}
          locations={locations}
          users={users}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
