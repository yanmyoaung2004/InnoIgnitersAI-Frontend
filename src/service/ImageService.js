export function uploadPicture(pic, onProgress) {
  return new Promise((resolve) => {
    if (!pic) {
      return resolve({
        status: false,
        msg: "Please select a picture",
        imgData: null,
      });
    }

    if (pic.type !== "image/jpeg" && pic.type !== "image/png") {
      return resolve({
        status: false,
        msg: "Invalid Picture Format",
        imgData: null,
      });
    }

    const cloudinaryURL =
      "https://api.cloudinary.com/v1_1/depbjqed1/image/upload";

    const uploadPreset = "chatSystem";

    const formData = new FormData();
    formData.append("file", pic);
    formData.append("upload_preset", uploadPreset);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable && typeof onProgress === "function") {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          const responseData = JSON.parse(xhr.responseText);
          resolve({
            status: true,
            msg: "Image Successfully Uploaded",
            imgData: responseData.url,
          });
        } catch (err) {
          console.log(err);
          resolve({
            status: false,
            msg: "Failed to parse upload response",
            imgData: null,
          });
        }
      } else {
        resolve({
          status: false,
          msg: "Failed to upload picture",
          imgData: null,
        });
      }
    };

    xhr.onerror = function () {
      resolve({
        status: false,
        msg: "An error occurred during the upload",
        imgData: null,
      });
    };

    xhr.open("POST", cloudinaryURL);
    xhr.send(formData);
  });
}
