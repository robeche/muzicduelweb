import QRCode from "qrcode";

export async function generateQRCode(url: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
    return dataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}
