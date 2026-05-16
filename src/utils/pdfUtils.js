import PDFDocument from "pdfkit";

/**
 * Generate a Participation Certificate
 * @param {Object} registration - Registration object
 * @param {Object} event - Event object
 * @param {Stream} stream - Write stream (like res)
 */
export const generateCertificate = (registration, event, stream) => {
  const doc = new PDFDocument({
    layout: "landscape",
    size: "A4",
    margin: 0,
  });

  doc.pipe(stream);

  // Background color
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#060b16");

  // Border
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
     .lineWidth(2)
     .stroke("#40e0d0");
  
  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
     .lineWidth(1)
     .stroke("#2d61ff");

  // Title
  doc.fillColor("#40e0d0")
     .fontSize(50)
     .font("Helvetica-Bold")
     .text("CERTIFICATE OF PARTICIPATION", 0, 150, { align: "center" });

  doc.fillColor("#ffffff")
     .fontSize(20)
     .font("Helvetica")
     .text("This is to certify that", 0, 230, { align: "center" });

  // Name
  doc.fillColor("#40e0d0")
     .fontSize(40)
     .font("Helvetica-Bold")
     .text(registration.userName.toUpperCase(), 0, 270, { align: "center" });

  doc.fillColor("#ffffff")
     .fontSize(20)
     .font("Helvetica")
     .text("has successfully participated in the event", 0, 340, { align: "center" });

  // Event
  doc.fillColor("#2d61ff")
     .fontSize(30)
     .font("Helvetica-Bold")
     .text(event.title.toUpperCase(), 0, 380, { align: "center" });

  doc.fillColor("#ffffff")
     .fontSize(16)
     .font("Helvetica")
     .text(`Held on ${new Date(event.eventDate).toLocaleDateString()}`, 0, 430, { align: "center" });

  // Footer / Organization
  doc.fillColor("#40e0d0")
     .fontSize(24)
     .font("Helvetica-Bold")
     .text("OTTER SOCIETY CLUB", 0, 500, { align: "center" });

  doc.end();
};
