import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import axios from "axios";

// If use .env without VITE_, the variables won't be available after build.
// If use .env with VITE_, the app will work after build, but the credentials will be exposed in the frontend 

// const DROPBOX_REFRESH_TOKEN = import.meta.env.VITE_DROPBOX_REFRESH_TOKEN; 
// const DROPBOX_APP_KEY = import.meta.env.VITE_DROPBOX_APP_KEY;
// const DROPBOX_SECRET_KEY = import.meta.env.DROPBOX_SECRET_KEY;

// Import from file
import json_data from "../keys.json"

const DROPBOX_REFRESH_TOKEN = json_data.VITE_DROPBOX_REFRESH_TOKEN;
const DROPBOX_APP_KEY = json_data.VITE_DROPBOX_APP_KEY;
const DROPBOX_SECRET_KEY = json_data.DROPBOX_SECRET_KEY;


function Upload() {
  const [file, setFile] = createSignal(null);
  const [uploading, setUploading] = createSignal(false);
  const [dragging, setDragging] = createSignal(false);
  const navigate = useNavigate();
  const [token, setToken] = createSignal(localStorage.getItem("dropbox_access_token") || "");

  const getAccessToken = async () => {
    try {
      const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          refresh_token: DROPBOX_REFRESH_TOKEN,
          grant_type: "refresh_token",
          client_id: DROPBOX_APP_KEY,
          client_secret: DROPBOX_SECRET_KEY,
        }),
      });

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem("dropbox_access_token", data.access_token);
        localStorage.setItem("token_expiry", Date.now() + data.expires_in * 1000);
        setToken(data.access_token);  // Update signal properly
        return data.access_token;
      } else {
        console.error("Failed to refresh token:", data);
      }
    } catch (error) {
      console.error("Error refreshing Dropbox token:", error);
    }
    return null;
  };

  const uploadToDropbox = async () => {
    if (!file()) {
      alert("Please select a file!");
      return;
    }

    setUploading(true);

    // Ensure valid access token
    let accessToken = token();
    if (!accessToken || Date.now() >= localStorage.getItem("token_expiry")) {
      accessToken = await getAccessToken();  // Fetch new token if expired
      if (!accessToken) {
        alert("Failed to get access token.");
        setUploading(false);
        return;
      }
    }

    const fileData = file();
    const filePath = `/uploads/${fileData.name}`;

    try {
      const response = await axios.post(
        "https://content.dropboxapi.com/2/files/upload",
        fileData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Ensure fresh token is used
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

      // Extract file path for sharing
      const fileId = encodeURIComponent(response.data.path_display);
      navigate(`/share/${fileId}`);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
      <h1 class="text-2xl font-bold mb-4">Upload a File</h1>
      <div
        class={`w-96 h-40 flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition ${dragging() ? "border-blue-500 bg-blue-100" : "border-gray-300"
          }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const droppedFile = event.dataTransfer.files[0];
          if (droppedFile) {
            setFile(droppedFile);
          }
        }}
      >
        {file() ? (
          <p class="text-gray-700">{file().name}</p>
        ) : (
          <p class="text-gray-500">Drag & Drop file here or click to select</p>
        )}
      </div>
      <div class="flex flex-row gap-4">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} class="hidden" id="fileInput" />
        <label
          for="fileInput"
          class="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
        >
          Select File
        </label>
        <button
          onClick={uploadToDropbox}
          class="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={uploading()}
        >
          {uploading() ? "Uploading..." : "Upload File"}
        </button>
      </div>


      {/* Bottom-right image with text note */}
      <div class="absolute bottom-4 right-4 w-80 flex flex-col items-center bg-white p-3 rounded shadow-lg pointer-events-none lg:p4">
        <img src="/yoroshiku-onegaishimasu-hero-600x338.png" alt="Info" class="w-36 lg:h-36 object-cover rounded mb-2" />
        <span class="text-sm text-gray-700 text-center">
          私のプロジェクトをご覧いただき、ありがとうございます。お時間とご配慮に感謝いたします。
        </span>
        <span class="text-sm text-gray-700 text-center">
          If you are recruiter or hiring manager, thank you for looking at my project. I appreciate your time and consideration.
        </span>
      </div>

      {/* 
      <div class="fixed bottom-4 right-4 w-72 flex flex-col items-center bg-white p-3 rounded shadow-lg pointer-events-none lg:w-80 lg:p-4">
        <img src="/yoroshiku-onegaishimasu-hero-600x338.png"
          alt="Info"
          class="w-20 h-20 object-cover rounded mb-2 lg:w-36 lg:h-36" />

        <span class="text-xs text-gray-700 text-center lg:text-sm">
          If you are a recruiter or hiring manager,
        </span>
        <span class="text-xs text-gray-700 text-center lg:text-sm">
          Thank you for looking at my project. I appreciate your time and consideration.
        </span>
      </div> */}


    </div>
  );
}

export default Upload;