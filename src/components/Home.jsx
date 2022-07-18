import React, { useEffect, useState } from "react";
import axios from "axios";
import MapContainer from "./Maps/MapContainer.jsx";
import GetUserGeolocation from "./Maps/UserGeoLocation.jsx";
import Navbar from "./Navbar.jsx";
import UserProfile from "./UserProfile.jsx";

export default function Home({
  token,
  currentUserId,
  apiKey,
  setIsLoggedIn,
  userName,
}) {
  const [map, setMap] = useState();
  const [favCarparks, setFavCarparks] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [lotsFromURA, setlotsFromURA] = useState();
  const [userLocation, setuserLocation] = useState();
  const [userZoom, setuserZoom] = useState(0);
  const [showUserProfile, setShowUserProfile] = useState(false);

  useEffect(() => {
    showHomepage();
    getAvailableCarparkInfo();
  }, []);

  const showHomepage = () => {
    axios
      .get("/homepage", {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((result) => {
        setMap(result.data.value);
      })
      .catch((error) => {
        console.log("Error message: ", error);
      });
  };

  const getAvailableCarparkInfo = () => {
    axios
      .get("/getCarparks", {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((result) => {
        console.log("get available lots");
        setlotsFromURA(result.data.carparks);
      })
      .catch((error) => {
        console.log("Unable to fetch carpark data: ", error);
      });
  };

  const getFavoriteCarparks = () => {
    const user = {
      userId: currentUserId,
    };
    axios
      .get("/favoriteCarparks", user)
      .then((result) => {
        // console.log(result.data);
        setFavCarparks(result.data.favoriteCarparks);
      })
      .catch((error) => {
        console.log("Unable to fetch carpark info: ", error);
      });
  };

  useEffect(() => {
    showHomepage();
    getAvailableCarparkInfo();
    getFavoriteCarparks();
  }, []);

  useEffect(() => {
    if (lotsFromURA != undefined) {
      setMounted(true);
    }
  }, [lotsFromURA]);

  useEffect(() => {
    console.log("mounted", mounted);
  }, [mounted]);

  if (!mounted)
    return (
      <div>
        <h1>Home page</h1>
        <h1>Waiting for Map to Load</h1>
      </div>
    );
  return (
    <div>
      {!showUserProfile ? (
        <div>
          <Navbar
            setShowUserProfile={setShowUserProfile}
            token={token}
            setIsLoggedIn={setIsLoggedIn}
            currentUserId={currentUserId}
          />
          <h1>Home page</h1>
          <div>
            {!mounted ? (
              <div>
                <h1>Waiting for Map to Load</h1>
              </div>
            ) : (
              <MapContainer
                apiKey={apiKey}
                currentUserId={currentUserId}
                token={token}
                mounted={mounted}
                setMounted={setMounted}
                lotsFromURA={lotsFromURA}
                userLocation={userLocation}
                userZoom={userZoom}
              />
            )}
            <GetUserGeolocation
              setuserLocation={setuserLocation}
              setuserZoom={setuserZoom}
            />
          </div>
          <div>
            <h5>My Favouriate Carparks</h5>
            <ul>
              {favCarparks.map((carpark, idx) => (
                <li key={String(idx)}>
                  <a href="">{carpark.carparkName}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <UserProfile currentUserId={currentUserId} userName={userName} />
      )}
    </div>
  );
}
