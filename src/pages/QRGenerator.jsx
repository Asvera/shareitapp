import { createSignal } from "solid-js";
import QRCode from "qrcode";

function QRGenerator() {
  const [text, setText] = createSignal("");
  const [qrCode, setQrCode] = createSignal("");

  const generateQRCode = async () => {
    try {
      if (text().trim() === "") return;
      const qr = await QRCode.toDataURL(text());
      setQrCode(qr);
    } catch (error) {
      console.error("QR Code generation failed:", error);
    }
  };

  return (
    <div class="flex flex-col items-center p-6 bg-gray-100">
      <h1 class="text-2xl font-bold mb-4">QR Code Generator</h1>
      <input
        type="text"
        placeholder="Enter text..."
        value={text()}
        onInput={(e) => setText(e.target.value)}
        class="border p-2 w-80 text-center mb-4"
      />
      <button
        onClick={generateQRCode}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Generate QR Code
      </button>
      {qrCode() && (
        <div class="mt-6">
          <p class="text-lg mb-2">Generated QR Code:</p>
          <img src={qrCode()} alt="QR Code" class="w-40 h-40 border rounded" />
        </div>
      )}
    </div>
  );
}

export default QRGenerator;
