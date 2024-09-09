import axios from "axios";

const MAPBOXTOKEN = import.meta.env.VITE_APP_MAPBOX_TOKEN;

const service = axios.create({
  baseURL: "https://api.mapbox.com",
  params: {
    access_token: MAPBOXTOKEN,
  },
});

export const getDirections = async (coordinates, profile = "walking") => {
  const stringifiedCoordinates = coordinates.join(";");

  try {
    const { data } = await service.get(
      `/directions/v5/mapbox/${profile}/${stringifiedCoordinates}?geometries=geojson&steps=true`
    );

    return data.routes[0].geometry.coordinates;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
