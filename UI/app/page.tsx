"use client";

import { Spinner } from "@nextui-org/react";
import dynamic from 'next/dynamic';
import { useEffect, useState, useMemo } from "react"

export default function Home() {
  const [city, setCity] = useState<string>("caen");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (data == null) {
      fetch(`https://data.lamant.io/mbtf/${city}.json`)
        .then(response => response.json())
        .then(data => setData(data));
    }
  }, [data]);

  const MapCity = useMemo(() => dynamic(() => import("@/components/map-city"), { ssr: false }), []);

  if (!data) {
    return (
      <section className="flex flex-col items-center justify-center gap-4">
        <Spinner label="Loading..." />
      </section>
    );
  }

  return (
    <section className="w-full h-full">
      <select
        className="bg-transparent outline-none text-2xl pr-4"
        defaultValue={city}
        onChange={(e) => { setCity(e.target.value); setData(null) }}
      >
        <option value="caen">Caen</option>
        <option value="le-havre">Le Havre</option>
      </select>
      <MapCity city={data} />
    </section>
  )
}
