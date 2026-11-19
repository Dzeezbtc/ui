/** Hands the viewer a text file to save (e.g. a hand's verification record). */
export function downloadTextFile(fileName: string, text: string, mimeType = "application/json"): void {
    const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
