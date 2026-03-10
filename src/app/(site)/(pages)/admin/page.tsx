import React from "react";
import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import AdminDashboard from "@/components/Admin/Dashboard";

export const metadata: Metadata = {
  title: "Tiny Libaas by Zayd - Admin",
  description:
    "Admin workspace for managing store data, catalog, and operations.",
};

const AdminPage = () => {
  return (
    <main>
      <Breadcrumb title={"Admin"} pages={["admin"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <AdminDashboard />
        </div>
      </section>
    </main>
  );
};

export default AdminPage;
