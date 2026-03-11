"use client";

import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import { getCurrentProfile, signOutUser } from "@/lib/supabase/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { UserProfile } from "@/types/user";

type MyAccountTab =
  | "dashboard"
  | "orders"
  | "downloads"
  | "addresses"
  | "account-details";

const MyAccount = () => {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [activeTab, setActiveTab] = useState<MyAccountTab>("dashboard");
  const [addressModal, setAddressModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getCurrentProfile()
      .then((p) => {
        setProfile(p);
        setFullName(p?.fullName || "");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const openAddressModal = () => setAddressModal(true);
  const closeAddressModal = () => setAddressModal(false);

  const handleSaveAccount = async () => {
    if (!supabase || !profile?.id) return;
    setMessage("");
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", profile.id);

    setIsSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setProfile((prev) => (prev ? { ...prev, fullName } : prev));
    setMessage("Account details updated.");
  };

  const handleSignOut = async () => {
    await signOutUser();
    window.location.href = "/signin";
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString()
    : "Recently";

  return (
    <>
      <Breadcrumb title={"My Account"} pages={["my account"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-b border-gray-3">
                <div className="max-w-[64px] w-full h-16 rounded-full overflow-hidden">
                  <Image
                    src="/images/users/user-04.jpg"
                    alt="user"
                    width={64}
                    height={64}
                  />
                </div>

                <div>
                  <p className="font-medium text-dark mb-0.5">
                    {profile?.fullName || "Customer"}
                  </p>
                  <p className="text-custom-xs">Member Since {memberSince}</p>
                </div>
              </div>

              <div className="p-4 sm:p-7.5 xl:p-9">
                <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                  {[
                    ["dashboard", "Dashboard"],
                    ["orders", "Orders"],
                    ["downloads", "Downloads"],
                    ["addresses", "Addresses"],
                    ["account-details", "Account Details"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as MyAccountTab)}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === key
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      {label}
                    </button>
                  ))}

                  <button
                    onClick={handleSignOut}
                    className="flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 bg-red text-white hover:opacity-90"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <div className="xl:max-w-[770px] w-full">
              {isLoading ? (
                <div className="bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
                  <p>Loading account...</p>
                </div>
              ) : null}

              {!isLoading && !profile ? (
                <div className="bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
                  <p className="text-dark mb-4">You are not signed in.</p>
                  <a href="/signin" className="text-blue hover:underline">
                    Go to Sign In
                  </a>
                </div>
              ) : null}

              {!isLoading && profile && activeTab === "dashboard" ? (
                <div className="bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
                  <p className="text-dark">
                    Hello {profile.fullName || "Customer"} ({profile.email})
                  </p>

                  <p className="text-custom-sm mt-4">
                    From your account dashboard you can view your recent orders,
                    manage your addresses, and edit your account details.
                  </p>
                </div>
              ) : null}

              {!isLoading && profile && activeTab === "orders" ? (
                <div className="bg-white rounded-xl shadow-1">
                  <Orders />
                </div>
              ) : null}

              {!isLoading && profile && activeTab === "downloads" ? (
                <div className="bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
                  <p>You don&apos;t have any downloads yet.</p>
                </div>
              ) : null}

              {!isLoading && profile && activeTab === "addresses" ? (
                <div className="flex-col sm:flex-row gap-7.5 flex">
                  <div className="xl:max-w-[370px] w-full bg-white shadow-1 rounded-xl">
                    <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">
                      <p className="font-medium text-xl text-dark">
                        Shipping Address
                      </p>

                      <button
                        className="text-dark ease-out duration-200 hover:text-blue"
                        onClick={openAddressModal}
                      >
                        Edit
                      </button>
                    </div>

                    <div className="p-4 sm:p-7.5">
                      <div className="flex flex-col gap-3 text-custom-sm">
                        <p>Name: {profile.fullName || "Not set"}</p>
                        <p>Email: {profile.email}</p>
                        <p>Phone: Not set</p>
                        <p>Address: Not set</p>
                      </div>
                    </div>
                  </div>

                  <div className="xl:max-w-[370px] w-full bg-white shadow-1 rounded-xl">
                    <div className="py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">
                      <p className="font-medium text-xl text-dark">
                        Billing Address
                      </p>
                    </div>
                    <div className="p-4 sm:p-7.5 text-custom-sm">
                      <p>Name: {profile.fullName || "Not set"}</p>
                      <p>Email: {profile.email}</p>
                      <p>Phone: Not set</p>
                      <p>Address: Not set</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {!isLoading && profile && activeTab === "account-details" ? (
                <div className="bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
                  <h3 className="font-medium text-xl text-dark mb-5">
                    Account Details
                  </h3>

                  {message ? (
                    <p className="text-custom-sm mb-4 text-blue">{message}</p>
                  ) : null}

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block mb-2.5">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-2.5">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5 outline-none opacity-70"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveAccount}
                    className="inline-flex font-medium text-white bg-dark py-3 px-7 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {addressModal ? (
        <AddressModal isOpen={addressModal} closeModal={closeAddressModal} />
      ) : null}
    </>
  );
};

export default MyAccount;
