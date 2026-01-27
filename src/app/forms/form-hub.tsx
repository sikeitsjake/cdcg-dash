"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { title } from "process";

interface FormsPageProps {
  userName: string;
}

const ALL_FORMS = [
  {
    id: "tues_breakdown",
    title: "Tuesday Breakdown Form",
    desc: "Form for logging Tuesday shipments.",
    category: "Inventory",
  },
  {
    id: "eod",
    title: "End of Day Report",
    desc: "Form to log end of day statistics.",
    category: "Internal",
  },
  {
    id: "req_time_off",
    title: "Request Time Off",
    desc: "Submit to request days off.",
    category: "Internal",
  },
  {
    id: "crab_invoices",
    title: "Crab Invoice Entry",
    desc: "Log which docks are sending what.",
    category: "Internal",
  },
];

export default function FormsPage({ userName }: FormsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter forms based on search input
  const filteredForms = ALL_FORMS.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header & Search Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {userName}, to the Form Hub!
          </h1>
          <p className="text-muted-foreground">
            Select a form to view or edit responses.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredForms.map((form) => (
          <Link key={form.id} href={`/forms/${form.id}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer group h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full">
                    {form.category}
                  </span>
                </div>
                <CardTitle className="group-hover:text-primary flex items-center gap-2">
                  {form.title}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </CardTitle>
                <CardDescription>{form.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}

        {filteredForms.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground">
              {`No forms found matching "${searchQuery}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
