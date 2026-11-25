import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { UsersTableSkeleton } from "@/components/users/users-table";
import { UsersView } from "@/components/users/users-view";

export const metadata: Metadata = { title: "Users" };

export default function UsersPage() {
  return (
    // UsersView reads the URL search params, which requires a Suspense boundary.
    <Suspense
      fallback={
        <Card className="mt-20 overflow-hidden">
          <UsersTableSkeleton />
        </Card>
      }
    >
      <UsersView />
    </Suspense>
  );
}
