import QRCode from "qrcode";

export const generateQRCodeBuffer = async (assetId) => {
  const url = `${process.env.FRONTEND_URL}/property-tagging/${assetId}`;

  return await QRCode.toBuffer(url, {
    type: "png",
    width: 300,
    margin: 1,
  });
};
