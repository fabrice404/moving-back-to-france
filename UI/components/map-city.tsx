import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { divIcon } from "leaflet";

export const getSVG = (outColor: string = "#ffffff", inColor: string = "#ffffff") => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="40" viewBox="0 0 256 256" xml:space="preserve">
  <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
    <path 
      d="M 45 90 c -1.415 0 -2.725 -0.748 -3.444 -1.966 l -4.385 -7.417 C 28.167 65.396 19.664 51.02 16.759 45.189 c -2.112 -4.331 -3.175 -8.955 -3.175 -13.773 C 13.584 14.093 27.677 0 45 0 c 17.323 0 31.416 14.093 31.416 31.416 c 0 4.815 -1.063 9.438 -3.157 13.741 c -0.025 0.052 -0.053 0.104 -0.08 0.155 c -2.961 5.909 -11.41 20.193 -20.353 35.309 l -4.382 7.413 C 47.725 89.252 46.415 90 45 90 z" 
      style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: ${outColor}; fill-rule: nonzero; opacity: 1;" 
      transform=" matrix(1 0 0 1 0 0) " 
      stroke-linecap="round" />
    <path d="M 45 45.678 c -8.474 0 -15.369 -6.894 -15.369 -15.368 S 36.526 14.941 45 14.941 c 8.474 0 15.368 6.895 15.368 15.369 S 53.474 45.678 45 45.678 z"
      style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: ${inColor}; fill-rule: nonzero; opacity: 1;" 
      transform=" matrix(1 0 0 1 0 0) " 
      stroke-linecap="round" />
  </g>
</svg>`

export const getIcon = (outColor: string = "#ffffff", inColor: string = "#ffffff") => divIcon({
  html: getSVG(outColor, inColor),
  className: "svg-icon",
  iconSize: [24, 40],
  iconAnchor: [12, 40],
  popupAnchor: [0, -30]
})

export default function MapCity({ city }: any) {
  return (
    <>
      <div className="flex items-center justify-end">
        <div dangerouslySetInnerHTML={{ __html: getSVG("#d5312c") }} />
        <div className="mr-5">Ecole primaire</div>
        <div dangerouslySetInnerHTML={{ __html: getSVG("#ffcc01") }} />
        <div className="mr-5">Collège</div>
        <div dangerouslySetInnerHTML={{ __html: getSVG("#0873d7") }} />
        <div className="mr-5">Lycée</div>
        <div dangerouslySetInnerHTML={{ __html: getSVG("#58ac45") }} />
        <div className="mr-5">Supermarché</div>
        <div dangerouslySetInnerHTML={{ __html: getSVG("#d26ab7") }} />
        <div className="mr-5">Boulangerie</div>
      </div>
      <MapContainer
        center={[city.center.lat, city.center.long]}
        className="w-full h-[95%]"
        zoom={12}
      >
        <TileLayer
          attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
        />
        {city.schools.map((s: any) => {
          let icon = getIcon();

          const inColor = s.secteur_prive_code_type_contrat === 99 ? "#ffffff" : "#000000";

          switch (s.nature_uai) {
            case 101: // ecole maternelle
            case 320: // lycee pro
            case 370: // enseignement adapté
            case 390: // segpa
            case 334: // enseignement professionnel
            case 380: // maison familliale rurale
              return;
            case 151: icon = getIcon("#d5312c", inColor); break; // ecole elementaire
            case 153: icon = getIcon("#d5312c", inColor); break; // ecole primaire d'application
            case 340: icon = getIcon("#ffcc01", inColor); break; // college
            case 300: icon = getIcon("#0873d7", inColor); break; // lycee general
            case 301: icon = getIcon("#0873d7", inColor); break; // lycee technologique
            case 302: icon = getIcon("#0873d7", inColor); break; // lycee general et technologique
            case 306: icon = getIcon("#0873d7", inColor); break; // lycee polyvalent
          }

          return (
            <Marker key={s.numero_uai}
              icon={icon}
              position={[s.position.lat, s.position.lon]}
            >
              <Popup>
                <div className="text-xl">{s.appellation_officielle}</div>
                {[s.adresse_uai, s.lieu_dit_uai, s.libelle_commune].filter(x => x).map((a, i) => <div key={`address${i}`}>{a}</div>)}
              </Popup>
            </Marker>
          )
        })}
        {city.supermarkets.map((s: any) => {
          return (
            <Marker key={s.id}
              icon={getIcon("#58ac45")}
              position={[s.location.latitude, s.location.longitude]}
            >
              <Popup>
                <div className="text-xl">{s.displayName.text}</div>
                <div dangerouslySetInnerHTML={{ __html: s.adrFormatAddress }} />
              </Popup>
            </Marker>
          )
        })}
        {city.bakeries.map((s: any) => {
          return (
            <Marker key={s.id}
              icon={getIcon("#d26ab7")}
              position={[s.location.latitude, s.location.longitude]}
            >
              <Popup>
                <div className="text-xl">{s.displayName.text}</div>
                <div dangerouslySetInnerHTML={{ __html: s.adrFormatAddress }} />
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </>
  )
}
