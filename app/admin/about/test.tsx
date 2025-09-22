"use client";

import React, { useState } from "react";
import Calendar from "@/components/admin/Calender";
import RequestList from "@/components/admin/RequestList"; // Komponen baru untuk menampilkan daftar permintaan

export default function RequestPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-6">
        <Calendar onDateClick={handleDateClick} />
        <RequestList selectedDate={selectedDate} />
      </div>
    </div>
  );
}
