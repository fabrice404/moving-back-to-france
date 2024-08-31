"use client";

import { Spinner } from "@nextui-org/react";
import dynamic from 'next/dynamic';
import { useEffect, useState, useMemo } from "react"

export default function Carte() {

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (data == null) {
      fetch(`${process.env.NEXT_PUBLIC_API_HOST}/carte`)
        .then(response => response.json())
        .then(data => setData(data));
    }
  }, [data]);


  const FullMap = useMemo(() => dynamic(() => import("@/components/full-map"), { ssr: false }), []);

  if (!data) {
    return (
      <section className="flex flex-col items-center justify-center gap-4">
        <Spinner label="Loading..." />
      </section>
    );
  }

  return (
    <section className="w-full shadow shadow-neutral-200 dark:shadow-neutral-700 p-4 rounded-xl h-full">
      <FullMap villes={data.items} />
    </section>
  )
}
