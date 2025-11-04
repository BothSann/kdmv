import {
  BakongKHQR,
  khqrData,
  IndividualInfo,
  MerchantInfo,
  SourceInfo,
} from "bakong-khqr";
import { getBakongProxyUrl, getBaseUrl } from "./config";

//Generate Individual KHQR
export function generateIndividualKHQR(amount) {
  const optionalData = {
    currency: khqrData.currency.usd,
    amount: amount,
    acquiringBank: "ACLEDA Bank",
    mobileNumber: "85586795490",
    storeLabel: "SOPHEAKBOTH THANN",
    terminalLabel: "SOPHEAKBOTH I",
    expirationTimestamp: Date.now() + 3 * 60 * 1000,
  };

  const individualInfo = new IndividualInfo(
    "thann_sopheakboth@aclb",
    "SOPHEAKBOTH THANN",
    "Phnom Penh",
    optionalData
  );

  const khqr = new BakongKHQR();

  return khqr.generateIndividual(individualInfo);
}

// Verify KHQR
export function verifyKHQR(KHQRString) {
  return BakongKHQR.verify(KHQRString).isValid;
}

// Decode KHQR
export function decodeKHQR(KHQRString) {
  const isValid = verifyKHQR(KHQRString);

  if (!isValid) {
    return { error: "Invalid KHQR" };
  }

  return BakongKHQR.decode(KHQRString);
}

// Generate KHQR deeplink
export async function generateKHQRDeepLink(KHQRString) {
  const proxyUrl = getBakongProxyUrl();
  console.log("Using proxy for deeplink:", proxyUrl);

  const deepLinkResponse = await BakongKHQR.generateDeepLink(
    `${proxyUrl}/v1/generate_deeplink_by_qr`,
    KHQRString
  );

  return { deepLinkURL: deepLinkResponse.data.shortLink };
}
