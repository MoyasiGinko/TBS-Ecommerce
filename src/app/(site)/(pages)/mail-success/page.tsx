import React from "react";
import MailSuccess from "@/components/MailSuccess";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tiny Libaas by Zayd - Mail Success",
  description:
    "Your message has been sent successfully. We will get back to you shortly. Thank you for contacting Tiny Libaas by Zayd.",
  // other metadata
};

const MailSuccessPage = () => {
  return (
    <main>
      <MailSuccess />
    </main>
  );
};

export default MailSuccessPage;
