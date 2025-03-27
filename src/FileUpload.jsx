import { createSignal } from 'solid-js';

function FileUploader() {
  const [file, setFile] = createSignal(null);
  const [uploading, setUploading] = createSignal(false);
  const [downloadUrl, setDownloadUrl] = createSignal('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file()) return;
    setUploading(true);
    
    try {
      // Request a signed URL from your backend (this should be implemented on Cloudflare Workers)
      const res = await fetch('/api/getSignedUrl', {
        method: 'POST',
        body: JSON.stringify({ filename: file().name, contentType: file().type }),
        headers: { 'Content-Type': 'application/json' }
      });
      const { uploadUrl, fileUrl } = await res.json();
      
      // Upload the file directly to Cloudflare R2
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file(),
        headers: { 'Content-Type': file().type }
      });
      
      setDownloadUrl(fileUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    }
    
    setUploading(false);
  };

  return (
    <div class="p-4 border rounded-xl shadow-lg w-full max-w-md mx-auto">
      <input type="file" onChange={handleFileChange} class="mb-2" />
      <button 
        onClick={uploadFile} 
        disabled={uploading()} 
        class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
        {uploading() ? 'Uploading...' : 'Upload File'}
      </button>
      {downloadUrl() && (
        <p class="mt-4 text-blue-600">
          <a href={downloadUrl()} target="_blank">Download File</a>
        </p>
      )}
    </div>
  );
}

export default FileUploader;
