const db = require('../config/db');
const { createCanvas, loadImage } = require('canvas');

// Helper function to draw signature paths
function drawSignature(ctx, signatureData, x, y, width, height) {
  if (!signatureData || signatureData.length === 0) return;

  // Find bounds of signature to scale it properly
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  signatureData.forEach(path => {
    path.forEach(point => {
      minX = Math.min(minX, point[0]);
      minY = Math.min(minY, point[1]);
      maxX = Math.max(maxX, point[0]);
      maxY = Math.max(maxY, point[1]);
    });
  });

  const sigWidth = maxX - minX;
  const sigHeight = maxY - minY;

  // Calculate scale to fit in our desired width/height
  const scale = Math.min(width / sigWidth, height / sigHeight) * 0.8;

  // Calculate offset to center the signature
  const offsetX = x + (width - sigWidth * scale) / 2 - minX * scale;
  const offsetY = y + (height - sigHeight * scale) / 2 - minY * scale;

  // Draw each path
  ctx.strokeStyle = '#212529'; // Dark color for signature
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  signatureData.forEach(path => {
    ctx.beginPath();
    ctx.moveTo(
      path[0][0] * scale + offsetX,
      path[0][1] * scale + offsetY
    );

    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(
        path[i][0] * scale + offsetX,
        path[i][1] * scale + offsetY
      );
    }
    ctx.stroke();
  });
}

const getCertificate = async (req, res) => {
  const { user_id, course_id } = req.query;

  if (!user_id || !course_id) {
    return res.status(400).send('Missing user_id or course_id');
  }

  try {
    // Fetch data
    const [[user]] = await db.query(`SELECT name FROM users WHERE id = ?`, [user_id]);
    const [[course]] = await db.query(`SELECT title FROM courses WHERE id = ?`, [course_id]);
    const [[enrollment]] = await db.query(`
            SELECT status FROM user_courses 
            WHERE user_id = ? AND course_id = ?`, [user_id, course_id]);
    const [[signature]] = await db.query(`SELECT signature FROM users WHERE id = ?`, [user_id]);

    if (!user || !course || !enrollment || enrollment.status !== 'completed') {
      return res.status(403).send("Certificate not available. Course not completed.");
    }

    // Create canvas
    const width = 1200;
    const height = 850;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw background (light color)
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#343a40';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Text styles
    ctx.fillStyle = '#212529';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';

    ctx.fillText('Certificate of Completion', width / 2, 150);

    ctx.font = '28px Arial';
    ctx.fillText('This is to certify that', width / 2, 250);

    ctx.font = '36px Arial bold';
    ctx.fillText(user.name, width / 2, 330);

    ctx.font = '28px Arial';
    ctx.fillText('has successfully completed the course', width / 2, 400);

    ctx.font = '32px Arial italic';
    ctx.fillText(course.title, width / 2, 460);

    ctx.font = '20px Arial';
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, width / 2, 520);

    // Signature section
    const signatureX = width - 300;
    const signatureY = height - 150;
    const signatureWidth = 250;
    const signatureHeight = 100;

    // Draw signature line
    ctx.strokeStyle = '#212529';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(signatureX, signatureY + signatureHeight - 20);
    ctx.lineTo(signatureX + signatureWidth, signatureY + signatureHeight - 20);
    ctx.stroke();

    // Draw signature label
    ctx.font = '18px Arial';
    ctx.fillText("Student Signature", signatureX + signatureWidth / 2, signatureY + signatureHeight + 10);

    // Draw the actual signature if available
    if (signature && signature.signature) {
      try {
        // Directly use the signature data (no JSON.parse needed)
        drawSignature(ctx, signature.signature, signatureX, signatureY-15, signatureWidth, signatureHeight);
      } catch (e) {
        console.error('Error drawing signature:', e);
      }
    }

    // Send image
    res.setHeader('Content-Type', 'image/png');
    canvas.pngStream().pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating certificate image.");
  }
};

module.exports = { getCertificate };