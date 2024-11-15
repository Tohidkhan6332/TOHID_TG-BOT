import fs from "fs";
import axios from "axios";
import FormData from "form-data";

/**
 * Converts bytes to a human-readable format.
 * @param {number} bytes - The number of bytes.
 * @param {number} [decimals=2] - The number of decimal places to display.
 * @returns {string} The human-readable string representation of bytes.
 * @throws {Error} If the input is not a non-negative number.
 */
export function formatBytes(bytes, decimals = 2) {
  if (typeof bytes !== "number" || bytes < 0) {
    throw new Error("Input must be a non-negative number");
  }
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const clientId = "8f777f61f80e4051b754d8e50310ad6e";
const clientSecret = "5802d3726d3149bfb880a577aa855fb3";
const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
  "base64",
);

/**
 * Retrieves an access token from the Spotify API.
 * @returns {Promise<string>} The access token.
 * @throws {Error} If an error occurs while obtaining the access token.
 */
export async function getAccessToken() {
  try {
    const tokenUrl = "https://accounts.spotify.com/api/token";
    const data = "grant_type=client_credentials";

    const tokenResponse = await axios.post(tokenUrl, data, {
      headers: {
        Authorization: `Basic ${base64Credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return tokenResponse.data.access_token;
  } catch (error) {
    console.error("Error getting Spotify access token:", error);
    throw new Error("An error occurred while obtaining Spotify access token.");
  }
}

export class Spotify {
  constructor() {
    this.baseUrl = "https://api.fabdl.com/";
  }

  /**
   * Searches for a track on Spotify.
   * @param {string} query - The name of the track to search for.
   * @returns {Promise<Object>} The search result containing track information.
   */
  async searchTrack(query) {
    try {
      const accessToken = await getAccessToken();
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`;

      const searchResponse = await axios.get(searchUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const firstTrack = searchResponse.data.tracks.items[0];
      if (!firstTrack) {
        return { error: "No result found" };
      }

      const result = {
        trackName: firstTrack.name,
        artistName: firstTrack.artists.map((artist) => artist.name).join(", "),
        externalUrl: firstTrack.external_urls.spotify,
        id: firstTrack.id,
      };

      return result;
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message,
      );
      return { error: "Failed to retrieve result" };
    }
  }

  /**
   * Uploads a media buffer to Pomf and returns the URL.
   * @param {Buffer} mediaBuffer - The media buffer to upload.
   * @returns {Promise<string>} The URL of the uploaded media.
   * @throws {Error} If an error occurs during the upload.
   */
  async pomf(mediaBuffer) {
    try {
      const form = new FormData();
      form.append("files[]", mediaBuffer, `file-${Date.now()}.mp3`);

      const { data } = await axios.post(
        "https://pomf.lain.la/upload.php",
        form,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
            ...form.getHeaders(),
          },
        },
      );

      return data.files[0].url;
    } catch (error) {
      console.error("Error uploading to Pomf:", error);
      throw new Error("Failed to upload to Pomf.");
    }
  }

  /**
   * Downloads media from a URL and returns the media buffer.
   * @param {string} url - The URL of the media to download.
   * @returns {Promise<Buffer>} The media buffer.
   * @throws {Error} If an error occurs during the download.
   */
  async converter(url) {
    try {
      const response = await axios({
        url,
        method: "GET",
        responseType: "arraybuffer",
      });

      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Failed execution");
    }
  }

  /**
   * Downloads a track from Spotify by its ID.
   * @param {string} trackId - The ID of the track to download.
   * @returns {Promise<Object>} The download result containing track information.
   * @throws {Error} If an error occurs during the download.
   */
  async downloadTrack(trackId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}spotify/get?url=${encodeURIComponent(`https://open.spotify.com/track/${trackId}`)}`,
      );
      const metaData = response.data.result;

      if (!metaData || !metaData.id) {
        throw new Error("Unable to retrieve metadata for the track.");
      }

      const convertResponse = await axios.get(
        `${this.baseUrl}spotify/mp3-convert-task/${metaData.gid}/${metaData.id}`,
      );
      const downloadUrl = convertResponse.data.result.download_url;

      if (!downloadUrl) {
        throw new Error("Download URL not found.");
      }

      const resultUrl = `https://api.fabdl.com${downloadUrl}`;
      const mediaBuffer = await this.converter(resultUrl);
      const uploadUrl = await this.pomf(mediaBuffer);

      return {
        title: metaData.name,
        artists: metaData.artists,
        duration: metaData.duration_ms,
        thumbnail: metaData.image,
        trackUrl: uploadUrl,
      };
    } catch (error) {
      console.error(
        "Download error:",
        error.response ? error.response.data : error.message,
      );
      throw new Error("Failed to download the track.");
    }
  }
}
