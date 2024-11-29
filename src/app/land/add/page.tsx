"use client"; // Required for client-side rendering in Next.js 14

import React, { useState, useEffect } from "react";
import Map from "../Components/Map";
import Land from "../Components/Land";
import GoogleMapComponent from "../Components/GoogleMap";

const MapWrapper: React.FC<{ id: number | null }> = ({ id }) => {
  const isLocked = id === null;

  useEffect(() => {
    console.log("MapWrapper updated - landId:", id); // Debugging log
  }, [id]);

  return (
    <div>
      {isLocked ? (
        <div className="bg-gray-200 text-gray-500 p-5 text-center">
          Map is locked. Please add land details to unlock.
        </div>
      ) : (
        <GoogleMapComponent id={id} />
      )}
    </div>
  );
};

const AddLand: React.FC = () => {
  const [responseData, setResponseData] = useState<any>(null);
  const [landId, setLandId] = useState<number | null>(null);

  const handleResponse = (data: any) => {
    console.log("Response data received:", data); // Debugging log

    // Ensure the response contains the land ID and update state
    if (data && data.id) {
      setLandId(data.id);  // Setting landId here
      console.log("Land ID set to:", data.id); // Debugging log to check landId update
    } else {
      console.log("Invalid response, no ID found.");
    }

    // Save the full response if needed for further use
    setResponseData(data);
  };

  useEffect(() => {
    console.log("landId updated:", landId); // Debugging log to verify landId change
  }, [landId]);

  // Determine if we are adding new land or viewing existing one
  const isAdding = landId === null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      <div className="lg:col-span-2">
        <MapWrapper id={landId} />
      </div>
      <div>
        <Land
          id={landId || 0} // Pass the landId to Land component, default to 0 if null
          title={landId ? "View Land Details" : "Add Land Details"}
          name=""
          location=""
          size=""
          owner=""
          land_type=""
          market_value=""
          notes=""
          add={isAdding} // Set to true if adding new land
          view={!isAdding} // Set to true if viewing existing land
          onResponse={handleResponse} // Receive response data via this handler
        />
        {!isAdding && landId && (
          <div className="mt-4 text-center">
            <p>Click on Edit to mark Land from map</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddLand;
