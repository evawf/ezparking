import React, { useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { Map } from "./Map.jsx";

export default function MapContainer ({apiKey, userLocation, userZoom, mounted, setMounted, lotsFromURA,currentUserId, token}) {

    const { isLoaded } = useLoadScript({
      googleMapsApiKey: apiKey
   });

   if (!isLoaded) return <div>Loading...</div>
   return <Map userLocation={userLocation} userZoom={userZoom} mounted={mounted} setMounted={setMounted} lotsFromURA={lotsFromURA} currentUserId={currentUserId} token={token} />
}
