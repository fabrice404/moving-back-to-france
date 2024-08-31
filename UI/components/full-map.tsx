import { MapContainer, GeoJSON, Tooltip, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { getScoreColor } from "@/helpers";
import { Ville } from "@/types";

export default function FullMap({ villes }: { villes: Ville[] }) {
  return (
    <MapContainer
      center={[46.603354, 1.888334]}
      className="w-full h-full"
      zoom={7}
    >
      <TileLayer
        attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
      />
      {villes.map((ville: any) => (
        <GeoJSON
          key={ville.code_insee}
          data={JSON.parse(ville.geo_shape)}
          eventHandlers={{
            click: () => {
              window.location.href = `/ville/${ville.code_insee}/${ville.nom}`;
            }
          }}
          style={{ color: getScoreColor(ville.score) }}
        >
          <Tooltip sticky direction="top">{ville.nom} #{ville.classement}</Tooltip>
        </GeoJSON>
      ))}
    </MapContainer>
  );
}
