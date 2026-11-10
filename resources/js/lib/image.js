// One place that shrinks photos on the device before upload. Phone cameras make 5-12 MB pictures, and the server accepts at most
// 4 MB per request, so an un-shrunk upload fails ("profile picture failed to upload"). Output: JPEG, longest side <= maxSide.
export async function compressImage(file, maxSide = 1600, quality = 0.82) {
    if (!file || !file.type || !file.type.startsWith("image/") || file.type === "image/gif") return file;
    try {
        const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";                       // transparent PNGs become white, not black, as JPEG
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
        if (!blob) return file;
        return new File([blob], (file.name || "photo").replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
    } catch {
        return file;                                      // the browser could not decode it (e.g. HEIC): send as is
    }
}

/** The message to show when an upload fails. */
export function uploadErrorMessage(e) {
    const r = e?.response;
    const errs = r?.data?.errors;
    if (r?.status === 413) return "That photo is too large. Please choose a smaller one.";
    if (errs) return Object.values(errs).flat()[0];
    if (r?.data?.message) return r.data.message;
    if (!r) return "No connection. Check your internet and try again.";
    return "The photo could not be uploaded. Please try a JPG or PNG.";
}
