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

    const templateStyles = [
      ...frameDocument.head.querySelectorAll('style, link[rel="stylesheet"]'),
    ];
    const { default: html2pdf } = await import("html2pdf.js");
    const pdfBlob = await html2pdf()
      .set({
        filename,
        margin: 0,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          onclone: async (clonedDocument) => {
            const stylesheetLoads = [];
            for (const style of templateStyles) {
              const clonedStyle = style.cloneNode(true);
              if (clonedStyle.tagName === "LINK") {
                stylesheetLoads.push(
                  new Promise((resolve) => {
                    clonedStyle.addEventListener("load", resolve, {
                      once: true,
                    });
                    clonedStyle.addEventListener("error", resolve, {
                      once: true,
                    });
                  }),
                );
              }
              clonedDocument.head.appendChild(clonedStyle);
            }
            await Promise.all(stylesheetLoads);
            await clonedDocument.fonts?.ready;
          },
        },
        jsPDF: {
          unit: "mm",
          format: pageFormat,
          orientation: "portrait",
        },
        pagebreak: { mode: ["css", "legacy"], avoid: ["tr", ".totals"] },
      })
      .from(root)
      .outputPdf("blob");
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
