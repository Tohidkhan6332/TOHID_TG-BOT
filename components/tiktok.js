import axios from "axios";
import FormData from "form-data";
import * as cheerio from "cheerio";

export async function tiktok(url) {
  try {
    const bodyForm = new FormData();
    bodyForm.append("q", url);
    bodyForm.append("lang", "id");

    const { data } = await axios.post(
      "https://savetik.co/api/ajaxSearch",
      bodyForm,
      {
        headers: {
          ...bodyForm.getHeaders(),
          "User-Agent": "PostmanRuntime/7.32.2",
        },
      },
    );

    const $ = cheerio.load(data.data);
    const isVideo = $("div.video-data > .photo-list").length === 0;

    const result = {
      status: true,
      type: isVideo ? "video" : "image",
      caption: $(
        "div.video-data > div > .tik-left > .thumbnail > .content > .clearfix > h3",
      ).text(),
      thumbnail: $(
        "div.video-data > div > div:nth-child(1) > div > div:nth-child(1) > img",
      ).attr("src"),
    };

    if (isVideo) {
      result.video = {
        server1: $(
          "div.video-data > div > .tik-right > div > p:nth-child(1) > a",
        ).attr("href"),
        server2: $(
          "div.video-data > div > .tik-right > div > p:nth-child(2) > a",
        ).attr("href"),
        serverHD: $(
          "div.video-data > div > .tik-right > div > p:nth-child(3) > a",
        ).attr("href"),
      };
      result.audio = {
        url: $(
          "div.video-data > div > .tik-right > div > p:nth-child(4) > a",
        ).attr("href"),
      };
    } else {
      result.audio = {
        url: $(
          "div.video-data > div > .tik-right > div > p:nth-child(2) > a",
        ).attr("href"),
      };
      result.images = [];
      $("div.video-data > .photo-list > ul > li").each(function () {
        result.images.push(
          $(this).find("div > div:nth-child(2) > a").attr("href"),
        );
      });
    }

    return result;
  } catch (err) {
    console.error("Error fetching TikTok:", err);
    return { status: false, message: "Video not found!" };
  }
}

export async function ttSearch(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: "POST",
        url: "https://tikwm.com/api/feed/search",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Cookie: "current_language=en",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        },
        data: {
          keywords: query,
          count: 10,
          cursor: 0,
          HD: 1,
        },
      });
      const videos = response.data.data.videos;
      if (videos.length === 0) {
        reject("Tidak ada video ditemukan.");
      } else {
        const gywee = Math.floor(Math.random() * videos.length);
        const videorndm = videos[gywee];

        const result = {
          title: videorndm.title,
          cover: videorndm.cover,
          origin_cover: videorndm.origin_cover,
          no_watermark: videorndm.play,
          watermark: videorndm.wmplay,
          music: videorndm.music,
        };
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
}
