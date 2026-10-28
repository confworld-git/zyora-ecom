import axios from "axios";

const waitForImages = (root) =>
  Promise.all(
    [...root.querySelectorAll("img")].map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        const finish = () => {
          window.clearTimeout(timeout);
          image.removeEventListener("load", finish);
          image.removeEventListener("error", finish);
          resolve();
        };
        const timeout = window.setTimeout(finish, 8000);
        image.addEventListener("load", finish, { once: true });
        image.addEventListener("error", finish, { once: true });
      });
    }),
  );

const downloadHtmlAsPdf = async (url, filename, pageFormat, config) => {
  const response = await axios.get(url, {
    ...config,
    responseType: "text",
  });
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.title = "PDF rendering surface";
  frame.style.cssText =
    "position:fixed;left:0;top:0;width:850px;height:1200px;border:0;z-index:-1;pointer-events:none;";

  try {
    const loaded = new Promise((resolve, reject) => {
      frame.addEventListener("load", resolve, { once: true });
      frame.addEventListener("error", reject, { once: true });
    });
    frame.srcdoc = response.data;
    document.body.appendChild(frame);
    await loaded;

    const frameDocument = frame.contentDocument;
    if (!frameDocument) {
      throw new Error("Unable to prepare the document for PDF download.");
    }

    await Promise.all([
      frameDocument.fonts?.ready,
      waitForImages(frameDocument),
    ]);

    const root = frameDocument.querySelector(".page, .label");
    if (!root) {
      throw new Error("The document template is missing its printable page.");
    }

    const contentHeight = Math.max(
      root.scrollHeight,
      root.getBoundingClientRect().height,
    );
    root.style.height = `${contentHeight}px`;
    root.style.minHeight = "0";
    root.style.overflow = "visible";

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const canvas = await html2canvas(root, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: Math.max(root.scrollWidth, root.offsetWidth),
      windowHeight: contentHeight,
    });
    const pdf = new jsPDF({
      unit: "mm",
      format: pageFormat,
      orientation: "portrait",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const fitScale = Math.min(
      pageWidth / canvas.width,
      pageHeight / canvas.height,
    );
    const imageWidth = canvas.width * fitScale;
    const imageHeight = canvas.height * fitScale;
    const imageX = (pageWidth - imageWidth) / 2;
    const imageY = (pageHeight - imageHeight) / 2;
    pdf.addImage(
      canvas.toDataURL("image/jpeg", 0.98),
      "JPEG",
      imageX,
      imageY,
      imageWidth,
      imageHeight,
    );
    const pdfBlob = pdf.output("blob");
    const objectUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } finally {
    frame.remove();
  }
};

export default downloadHtmlAsPdf;
