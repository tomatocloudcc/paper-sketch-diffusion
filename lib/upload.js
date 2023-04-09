import packageData from "../package.json";
import dataUriToBuffer from "lib/data-uri-to-buffer";

const UPLOAD_IO_ACCOUNT_ID = "W142hmA";
const UPLOAD_IO_PUBLIC_API_KEY = "public_W142hmAGE5wjpx84mHboNNXWvUmM";

export default async function uploadFile(scribbleDataURI) {
  const uploadManager = new Upload.UploadManager(
    new Upload.Configuration({
      apiKey: UPLOAD_IO_PUBLIC_API_KEY,
    })
  );

  const { fileUrl } = await uploadManager.upload({
    accountId: UPLOAD_IO_ACCOUNT_ID,
    data: dataUriToBuffer(scribbleDataURI),
    mime: "image/png",
    originalFileName: "scribble_input.png",
    path: {
      // See path variables: https://upload.io/docs/path-variables
      folderPath: `/uploads/${packageData.name}/${packageData.version}/{UTC_DATE}`,
      fileName: "{ORIGINAL_FILE_NAME}_{UNIQUE_DIGITS_8}{ORIGINAL_FILE_EXT}",
    },
    metadata: {
      userAgent: navigator.userAgent,
    },
  });

  return fileUrl;
}
