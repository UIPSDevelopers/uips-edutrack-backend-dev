import QRCode from "qrcode";

/**
 * Generates a QR code as a data URL (base64 image)
 * @param {Object} assetData - info to encode in QR
 * @returns {string} data URL of QR code
 */
export const generateQRCode = async (assetData) => {
  // Example: encode serialNo, assetName, category, location
  const qrPayload = JSON.stringify({
    serialNo: assetData.serialNo,
    assetName: assetData.assetName,
    category: assetData.categoryName,
    location: assetData.locationName || "",
  });

  const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);
  return qrCodeDataUrl;
};
