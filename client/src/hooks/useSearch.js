import { ref, watch } from "vue";
import axios from "axios";

/**
 *
 * @param {string} token
 * @param {string} An ISO 3166-2 2 part code for the country, eg: "pt" for Portugal // This is still todo
 * @returns
 */

export const useSearch = (defaultSearch, token, region) => {
  if (!token)
    throw Error(
      `No mapbox token provided, please provide one in order to use this `
    );

  const results = ref([]);
  const search = ref(defaultSearch);
  const error = ref(null);
  const loading = ref(false);
  const timeoutId = ref(null);

  const performSearch = async () => {
    if (search.value === "") {
      clearResults();
      loading.value = false;
      return;
    }

    try {
      const { data } = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${search.value}.json?access_token=${token}`
      );
      // const { data } = await axios.get(
      //   `https://api.mapbox.com/geocoding/v5/mapbox.places/${search.value}.json?access_token=${token}&country=pt`
      // );
      results.value = data.features;
      loading.value = false;
    } catch (err) {
      if (err.response && err.response.data) {
        console.error(err.response.data);
        error.value = err.response.data;
      } else {
        error.value = err;
      }
    }
  };

  watch(search, () => {
    /**
     * Issue with this implementation is if we change the search value with a real address, it will trigger
     * this function again :s
     * Must find a way to use setSearch with v-model or have a @input or @change function set on the <Field />
     * component
     */
    timeoutId.value && clearTimeout(timeoutId.value);

    const foundElement = results.value.find((place) => {
      return place.place_name === search.value;
    });

    if (foundElement) {
      clearResults();
      // search.value = search.value;
      return;
    }

    /**
     * Debounce
     */
    loading.value = true;
    clearResults();

    timeoutId.value = setTimeout(() => {
      performSearch();
    }, 500);
  });

  const setSearch = (placeName) => {
    search.value = placeName;
  };

  const clearResults = () => {
    results.value = [];
  };

  return {
    results,
    search,
    loading,
    setSearch,
  };
};
