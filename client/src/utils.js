import axios from "axios";

export const handleError = (err) => {
  if (axios.isAxiosError(err)) {
    return {
      message: err.response.data.message,
      type: "error",
      status: err.response.status,
    };
  } else {
    return {
      message: err.message,
      type: "error",
      status: 500,
    };
  }
};

export const nakala = {
  getFileURI: (dataId, fileId) => {
    return `https://api.nakala.fr/data/10.34847/${dataId}/${fileId}`;
    // return `https://apitest.nakala.fr/data/10.34847/${dataId}/${fileId}`;
  },
};

export const getProperty = (object, key) => {
  if (key.includes(".")) {
    let tempValue = object;

    const keys = key.split(".");

    for (const currentKey of keys) {
      if (tempValue === undefined) return undefined;
      tempValue = tempValue[currentKey];
    }
    return tempValue;
  } else {
    return object[key];
  }
};

export const getFileTypeFromMimeType = (mimetype) => {
  /**
   * mimetype can be application/json or image/jpeg or image/png or video/mp4
   * First part is the type, second part is the subtype
   * We split the first part to get the type.
   *
   * We will match video for video/
   * ------------- image for image/
   * ------------- audio for audio/
   * And any other file we will return simply as file
   */

  const [type] = mimetype.split("/");
  /**
   * We keep the one below in case we want to know what file type it is, pdf, doc etc..
   */
  // const [type,subtype] = mimetype.split("/");

  if (!["video", "audio", "image"].includes(type)) return "file";
  else return type;
};

export const formatSize = (size) => {
  const units = ["B", "KB", "MB"];
  let i = 0;
  while (size >= 1000) {
    size /= 1000;
    ++i;
  }
  return `${size.toFixed(2)} ${units[i]}`;
};

export const parseError = (error) => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response.data.message,
      status: error.response.status,
    };
  } else {
    return {
      message: error.message,
      status: "error",
    };
  }
};
