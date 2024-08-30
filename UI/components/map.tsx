import { MapContainer, GeoJSON, TileLayer, Tooltip } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { getScoreColor } from "@/helpers";

export default function Map({ ville }: any) {
  return (
    <MapContainer
      center={[ville.geo_latitude, ville.geo_longitude]}
      className="w-full h-full"
      zoom={12}
    >
      <TileLayer
        attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
      />
      <GeoJSON data={JSON.parse(ville.geo_shape)}>
        <Tooltip sticky direction="top">{ville.nom}</Tooltip>
      </GeoJSON>
      {ville.voisins.map((voisin: any) => (
        <GeoJSON
          key={voisin.code_insee}
          data={JSON.parse(voisin.geo_shape)}
          eventHandlers={{
            click: () => {
              window.location.href = `/ville/${voisin.code_insee}/${voisin.nom}`;
            }
          }}
          style={{ color: getScoreColor(voisin.score) }}
        >
          <Tooltip sticky direction="top">{voisin.nom} #{voisin.classement}</Tooltip>
        </GeoJSON>
      ))}
    </MapContainer>
  );
};
