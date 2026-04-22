import QRCode from "qrcode";

/**
 * Generates a QR code that redirects to asset details page
 * @param {string} assetId
 * @returns {string} data URL (QR image)
 */
export const generateQRCode = async (assetId) => {
  const url = `${process.env.FRONTEND_URL}/property-tagging/assets/${assetId}`;

  return await QRCode.toDataURL(url);
};
