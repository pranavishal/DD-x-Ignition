import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rentals & Stays — Urban Marble",
  description:
    "Find apartments, hotels, hostels, and short-term rentals on an interactive 3D map.",
};

export default function RentalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
