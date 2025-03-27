import { createSignal, createEffect } from "solid-js";
import axios from "axios";

const DROPBOX_ACCESS_TOKEN = "sl.u.AFku-XEtYL4YRCgTQJj-2bvyJaVJqmcdThGkhSDyNkoxYz5yUXNSvR76C5Wns0BVLuA40qrgAwBKUJBP8R1UFAsd3RG7tg3QZZXIWPtrn7KJO7AIvFpi6RsRhC2rvksnyFFiDl20viLXs1bPO7dlSxT-CxWydlc8zhT_hQL6YLXryvX1usZusdfccj3HgjnljNtJd8MpVVqhigCLua_OnzzvrLTz4I018QYHcPThCEvLKa2CC2j6YO1l2CLzEQWDKy5YXi4kG_00IJKaZzY5sb_cHoBbYwAOdYe1ZBj9dninQi_hnCHIS4RVSL-6SWu9B-PLgGH1q5sQDZmrv2VyZEX_JQtK1GXOGOwADdvynrNQPUtZISI_ohfN0m3k6_psUQinOKa28JApAvOnISVVM9FkYyqvCwfDvTV818XoGM8kBOZuPpJGCNaWGaX43BcOY1_9F1hoJK2UIY1W6IPcwFJGdyEkWevfU-HvJjP-vYp-s1rgr1l6U74mUqkZNF925_2eQ9CQYljploCWySyooJMwtJFRuMFLygXqxv33ggMpiWvA2s4J6RjNoOqbaHjEYqet7w2HvaqdJXEnFMEzbOXdB4caYAWJNmSPr0ZsBAQeyMQeZUdvaPN2uEZx9zP4t9PGclyMD22M-Cfq6lmY8iTfaonBSVAdfEtTXDl7En90C54JYcmW4p144q3EO5FSURy_gIzeDHsIzpkDsSw8BWc_ElK8YJ9MfW0kLWUnb1vvcsCnqWrwNueC0q5bNV6fdKbXquCMZ7JRJFlmdXzy1yjWIHjLr8IXc2yaEkVlFaRPkWRTXjTGKKou46GNL9zkt94bzEcS1SZ2RM4wOE7s7dzSkZlnXYA_Y3T_qnuGxUhh_fA7fApntU_ktyL-TZ7sdNd6GgBBlIfxPXklUgOqmZ-ojoz1B5rqRluKqZZ1x_Rclevrsi-N6iHbe8P4jocDG6Tw_XhU44uTZOoshmUXmlcoQT9cUB_xaRxP--zga0E_47Eg-cB6xqKUKu8WsDm_GX_Md5TdbGvPWVdV8_Axy7kXt3E05KCCBJlpVgXP8L9xA3s5deZ6serkQvexfeVojF5K0IepY7bYcfuO8lYagyACdS3WwdN50c8xu2PTZ4XUg36X4qzleJDPNSTAFETdSmuv9Xr_gD6GW6T1D2DkoRiSyW4DyxnrDQgTrlkUcyakBDT-MLCcsw9qiV_b-cRJpLcw5BgYlNoFHeiVBy1rcsIU72qpW0Ay3q8DOeRyh6Gaht8o8q8zsLxgpOjU9B47i8a9TR_1bdIwZkmdK6z2_Zv3vIPyP6M0sVDnZ_evLVdZnIcFRFmdB5VBslXRGZeA3glIshk7V2c3Rv9wL9nma4iK9r67Vzf6Z6Ebrwo96Wjp4bctMDXTzSEbsBkoPuBDv9Ae3uFvGkaRSxKj2Mu4snSo"

const DROPBOX_FOLDER = "/uploads"; // Folder where files are stored

function App() {
  const [file, setFile] = createSignal(null);
  const [dragging, setDragging] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);
  const [files, setFiles] = createSignal([]);

  // Fetch uploaded files from Dropbox
  const fetchFiles = async () => {
    try {
      const response = await axios.post(
        "https://api.dropboxapi.com/2/files/list_folder",
        { path: DROPBOX_FOLDER },
        {
          headers: {
            Authorization: `Bearer ${DROPBOX_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      setFiles(response.data.entries);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  };

  createEffect(() => {
    fetchFiles(); // Fetch files on component mount
  });

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle drag-and-drop
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  // Upload file to Dropbox
  const uploadToDropbox = async () => {
    if (!file()) {
      alert("Please select a file!");
      return;
    }

    setUploading(true);
    const fileData = file();
    const filePath = `${DROPBOX_FOLDER}/${fileData.name}`; // Dropbox file path

    try {
      await axios.post(
        "https://content.dropboxapi.com/2/files/upload",
        fileData,
        {
          headers: {
            Authorization: `Bearer ${DROPBOX_ACCESS_TOKEN}`,
            "Content-Type": "application/octet-stream",
            "Dropbox-API-Arg": JSON.stringify({
              path: filePath,
              mode: "add",
              autorename: true,
              mute: false,
            }),
          },
        }
      );

      alert(`File uploaded successfully!`);
      setFile(null);
      fetchFiles(); // Refresh file list after upload
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed! Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  // Generate Dropbox file download link
  const getDownloadLink = async (filePath) => {
    try {
      const response = await axios.post(
        "https://api.dropboxapi.com/2/files/get_temporary_link",
        { path: filePath },
        {
          headers: {
            Authorization: `Bearer ${DROPBOX_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      window.open(response.data.link, "_blank");
    } catch (error) {
      console.error("Failed to get download link:", error);
    }
  };

  return (
    <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
      <h1 class="text-2xl font-bold mb-4">SolidJS File Sharing with Dropbox</h1>

      {/* Drag and Drop Box */}
      <div
        class={`w-96 h-40 flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition ${
          dragging() ? "border-blue-500 bg-blue-100" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file() ? (
          <p class="text-gray-700">{file().name}</p>
        ) : (
          <p class="text-gray-500">Drag & Drop file here or click to select</p>
        )}
      </div>

      {/* File Input */}
      <input type="file" onChange={handleFileChange} class="hidden" id="fileInput" />
      <label
        for="fileInput"
        class="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
      >
        Select File
      </label>

      {/* Upload Button */}
      <button
        onClick={uploadToDropbox}
        class="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        disabled={uploading()}
      >
        {uploading() ? "Uploading..." : "Upload File"}
      </button>

      {/* File List */}
      <div class="mt-6 w-96 bg-white p-4 rounded-lg shadow-lg">
        <h2 class="text-lg font-semibold mb-3">Uploaded Files</h2>
        <ul>
          {files().length === 0 ? (
            <p class="text-gray-500">No files uploaded yet.</p>
          ) : (
            files().map((file) => (
              <li
                class="flex justify-between items-center p-2 border-b"
                key={file.id}
              >
                <span class="text-gray-700">{file.name}</span>
                <button
                  class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  onClick={() => getDownloadLink(file.path_lower)}
                >
                  Download
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
