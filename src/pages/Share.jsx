import { useParams } from "@solidjs/router";
import { createSignal, createEffect } from "solid-js";
import axios from "axios";
import QRCode from "qrcode";

function Share() {
    const params = useParams();
    const fileId = decodeURIComponent(params.fileId);
    const [shareableLink, setShareableLink] = createSignal("");
    const [copied, setCopied] = createSignal(false);
    const [qrCode, setQrCode] = createSignal("");
    const [token, setToken] = createSignal(localStorage.getItem("dropbox_access_token") || "");


    createEffect(async () => {
        try {
            const response = await axios.post(
                "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",
                { path: fileId },
                {
                    headers: {
                        Authorization: `Bearer ${token()}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            setShareableLink(response.data.url.replace("?dl=0", "?dl=1"));
            generateQRCode();
        } catch (error) {
            console.error("Failed to fetch shareable link:", error);
            setShareableLink("Error generating link");
        }
    });

    const copyToClipboard = async () => {
        if (shareableLink() && shareableLink() !== "Error generating link") {
            try {
                await navigator.clipboard.writeText(shareableLink());
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error("Copy failed:", error);
            }
        }
    };



    const generateQRCode = async () => {
        if (shareableLink() && shareableLink() !== "Error generating link") {
            try {
                const qr = await QRCode.toDataURL(shareableLink());
                setQrCode(qr);
                // console.log(shareableLink);
            } catch (error) {
                console.error("QR Code generation failed:", error);
            }
        }
    };

    return (
        <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
            <h1 class="text-2xl font-bold mb-4">File Uploaded Successfully!</h1>
            <p class="text-lg mb-4">Share this link with anyone:</p>
            <div>
                <div class="flex flex-col items-center p-6 bg-gray-100">
                    <h1 class="text-2xl font-bold mb-4">QR Code</h1>
                    {qrCode() && (
                        <div class="mt-6">
                            <p class="text-lg mb-2">Generated QR Code:</p>
                            <img src={qrCode()} alt="QR Code" class="w-40 h-40 border rounded" />
                        </div>
                    )}
                </div>
            </div>
            <input
                type="text"
                value={shareableLink()}
                class="border p-2 w-80 text-center"
                readonly
            />
            <button
                onClick={copyToClipboard}
                class="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
                {copied() ? "Copied!" : "Copy Link"}
            </button>
        </div>
    );
}

export default Share;