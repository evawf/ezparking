import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  MarkerClusterer,
} from "@react-google-maps/api";
import myPlaces from "./FilteredList.jsx";
import axios from "axios";

export function Map({
  userLocation,
  userZoom,
  setMounted,
  mounted,
  lotsFromURA,
  currentUserId,
  token,
  favCarparks,
  setFavCarparks,
}) {
  const [mapRef, setMapRef] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [markerMap, setMarkerMap] = useState({});
  const [center, setCenter] = useState({ lat: 1.287953, lng: 103.851784 });
  const [zoom, setZoom] = useState(5);
  const [infoOpen, setInfoOpen] = useState(false);
  const [isFiltered, setisFiltered] = useState(false);
  const [newList, setnewList] = useState([]);

  useEffect(() => {
    setCenter(userLocation);
    setZoom(userZoom);
  }, [userLocation]);

  // Iterate myPlaces to size, center, and zoom map to contain all markers
  const fitBounds = (map) => {
    const bounds = new window.google.maps.LatLngBounds();

    myPlaces.forEach((place) => {
      bounds.extend(place.position);
    });

    map.fitBounds(bounds);
  };

  const loadHandler = (map) => {
    // Store a reference to the google map instance in state
    setMapRef(map);
    // Fit map bounds to contain all markers
    fitBounds(map);
  };

  // We have to create a mapping of our places to actual Marker objects
  const markerLoadHandler = (marker, place) => {
    return setMarkerMap((prevState) => {
      return { ...prevState, [place.ppCode]: marker };
    });
  };

  const markerClickHandler = (event, place) => {
    // Remember which place was clicked
    // console.log(place);
    setSelectedPlace(place);

    // Required so clicking a 2nd marker works as expected
    if (infoOpen) {
      setInfoOpen(false);
    }

    setInfoOpen(true);

    // If you want to zoom in a little on marker click
    if (zoom < 13) {
      setZoom(13);
    }
    // if you want to center the selected Marker
    setCenter(place.pos);
  };

  function openMapsHandler(event, selectedPlace) {
    console.log(selectedPlace);
    const { lat, lng } = selectedPlace.position;
    window.open(
      "https://www.google.com/maps/search/?api=1&query=" + lat + "%2C" + lng,
      "_blank"
    );
  }

  async function favouritesHandler(event, selectedPlace) {
    console.log(selectedPlace);
    const { ppCode, parkingSystem, ppName } = selectedPlace;

    const userCarparkInfo = {
      userId: currentUserId,
      carparkNo: ppCode,
      lotType: parkingSystem,
      carparkName: ppName,
    };

    const Headers = {
      headers: {
        Authorization: "Bearer " + token,
      },
    };
    console.log("favorite carparks: ", favCarparks);
    console.log("user carpark info: ", userCarparkInfo);
    axios
      .post("/addCarpark", userCarparkInfo, Headers)
      .then((result) => {
        console.log(result.data);
        let msg = result.data;
        if (msg === "Already added.") {
          alert("Already add as favorite carpark!");
          location.reload();
        }
        let newFavoriteCarpark = result.data.newFavoriteCarpark;
        let newFavoriteCarparks = [...favCarparks, newFavoriteCarpark];
        setFavCarparks(newFavoriteCarparks);
      })
      .catch((error) => {
        console.log("Error message: ", error);
      });
  }
  // console.log("available carparks:", lotsFromURA);
  if (mounted && lotsFromURA != undefined && !isFiltered) {
    const newList = myPlaces.map((item) => {

  let variable = lotsFromURA.find((c) => item.ppCode === c.carparkNo);
      let availableLots = 0;
      if (variable !== undefined) {
        availableLots = variable.lotsAvailable;
      }
      return {
        ...item,
        lotsAvailable: Number(availableLots),
      };
    });
    console.log("newlist", newList);
    setisFiltered(true);
    setnewList(newList);

  }

  if (newList.length > 0) {
    return (
      <GoogleMap
        onLoad={loadHandler}
        zoom={zoom}
        center={center}
        mapContainerClassName="map-container"
      >
        <MarkerClusterer>
          {(clusterer) =>
            newList.map((place) => (
              <Marker
                key={place.ppCode}
                clusterer={clusterer}
                position={place.position}
                onLoad={(marker) => markerLoadHandler(marker, place)}
                onClick={(event) => markerClickHandler(event, place)}
              />
            ))
          }
        </MarkerClusterer>

        {infoOpen && selectedPlace && (
          <InfoWindow
            anchor={markerMap[selectedPlace.ppCode]}
            onCloseClick={() => setInfoOpen(false)}
          >
            <div>
              <h4>{selectedPlace.ppName}</h4>
              <hr />
              <div>{selectedPlace.ppCode}</div>
              <div>Available Lots: {selectedPlace.lotsAvailable}</div>
              <div>Vehicle Category:{selectedPlace.vehCat}</div>
              <br />
              <button
                type="button"
                className="btn btn-primary"
                onClick={(event) => openMapsHandler(event, selectedPlace)}
              >
                Open Maps
              </button>
              &nbsp;
              <button
                type="button"
                className="btn btn-primary"
                onClick={(event) => favouritesHandler(event, selectedPlace)}
              >
                Favourite
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    );
  }
}
