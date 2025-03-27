import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import axios from "axios";

const DROPBOX_ACCESS_TOKEN = import.meta.env.VITE_DROPBOX_ACCESS_TOKEN; // Use environment variable

function Upload() {
  const [file, setFile] = createSignal(null);
  const [uploading, setUploading] = createSignal(false);
  const [dragging, setDragging] = createSignal(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

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

  const uploadToDropbox = async () => {
    if (!file()) {
      alert("Please select a file!");
      return;
    }

    setUploading(true);
    const fileData = file();
    const filePath = `/uploads/${fileData.name}`;

    try {
      const response = await axios.post(
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
      <div class="flex flex-row gap-4">
        <input type="file" onChange={handleFileChange} class="hidden" id="fileInput" />
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
    </div>
  );
}

export default Upload;
