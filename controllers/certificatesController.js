const db = require('../config/db');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');
// Register fonts before you create canvas
registerFont(path.join(__dirname, '../fonts/GreatVibes.ttf'), { family: 'Great Vibes' });
registerFont(path.join(__dirname, '../fonts/ManufacturingConsent.ttf'), { family: 'Manufacturing Consent' });

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
    // Colors
    const accent = 'rgb(255, 0, 0)';
    const primary = 'rgb(94, 96, 206)';
    const grayText = '#6c757d';
    const secondary = 'rgb(44, 62, 80)';

     // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, width, height);

    // Draw inner border with light gray
    ctx.strokeStyle = grayText;
    ctx.lineWidth = 1;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    
     // Draw coloaccent corners
    drawCorners(ctx, width, height, accent, primary);

    // Logo or Title Brand
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px "Times New Roman", Times, serif';
    ctx.textAlign = 'center';

    // CERTIFICATE
    ctx.fillStyle = '#111';
    ctx.font = 'bold 40px "Times New Roman", Times, serif';
    ctx.fillText('CERTIFICATE', width / 2, 120);

    // "OF PARTICIPATION" Ribbon
    const ribbonWidth = 300;
    const ribbonHeight = 50;
    const ribbonX = (width - ribbonWidth) / 2;
    const ribbonY = 160;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(ribbonX, ribbonY);
    ctx.lineTo(ribbonX + ribbonWidth, ribbonY);
    ctx.lineTo(ribbonX + ribbonWidth - 25, ribbonY + ribbonHeight);
    ctx.lineTo(ribbonX + 20, ribbonY + ribbonHeight);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 25px "Times New Roman", Times, serif';
    ctx.fillText('OF COMPLETION', width / 2, ribbonY + 35);

    // Subheading
    ctx.fillStyle = primary;
    ctx.font = '18px';
    ctx.fillText('THIS CERTIFICATE IS PROUDLY PRESENTED TO', width / 2, 260);

    // Recipient name
    ctx.fillStyle = '#000';
   ctx.font = 'bold 30px "Great Vibes"';
    ctx.fillText(user.name, width / 2, 310);

    // Recipient name
    ctx.fillStyle = grayText;
    ctx.font = '18px "Manufacturing Consent"';
    ctx.fillText('For successfully completing the course of', width / 2, 360);

    // Course name
    ctx.fillStyle = primary;
    ctx.font = 'bold 25px "Great Vibes"';
    ctx.fillText(course.title, width / 2, 410);

    ctx.stroke();
    
    // Description (Latin)
    ctx.fillStyle = grayText;
    ctx.font = '16px "Times New Roman", Times, serif';
    const message = "This certifies that the recipient has demonstrated exceptional dedication, skill, and commitment throughout the course. His/her active participation, timely submissions, and eagerness to learn have been exemplary. We extend our heartfelt congratulations on this accomplishment and wish him/her continued success in all his/her future endeavors.";
    wrapText(ctx, message, width / 2, 470, width - width / 3, 32);
    
    // Date
    ctx.fillStyle = '#000';
    ctx.font = '16px "Times New Roman", Times, serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${new Date().toLocaleDateString()}`, 170,  height - 125);
    ctx.fillText('DATE', 180, height - 100);

    // Date line
    ctx.beginPath();
    ctx.moveTo(300, height - 120);
    ctx.lineTo(100, height - 120);
    ctx.stroke();

    // Signature line
    ctx.beginPath();
    ctx.moveTo(width - 300, height - 120);
    ctx.lineTo(width - 100, height - 120);
    ctx.stroke();

    // Signature label
    ctx.textAlign = 'center';
    ctx.fillText('SIGNATURE', width - 200, height - 100);

    drawMedal(ctx, width, height, accent, primary, secondary);


    // Signature section
    const signatureX = width - 300;
    const signatureY = height - 150;
    const signatureWidth = 250;
    const signatureHeight = 100;

    // Draw the actual signature if available
    if (signature && signature.signature) {
      try {
        // Directly use the signature data (no JSON.parse needed)
        drawSignature(ctx, signature.signature, signatureX, signatureY-50, signatureWidth, signatureHeight);
      } catch (e) {
        console.error('Error drawing signature:', e);
      }
    }

    // Send image
    res.setHeader('Content-Type', 'image/png');
    canvas.pngStream().pipe(res);



    

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

function drawMedal(ctx, width, height, accent, primary, secondary) {
    // Ribbon below badge
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 30, height - 140);
    ctx.lineTo(width / 2 - 30, height - 80);
    ctx.lineTo(width / 2, height - 107);
    ctx.lineTo(width / 2 + 30, height - 80);
    ctx.lineTo(width / 2 + 30, height - 140);
    ctx.closePath();
    ctx.fill();

    const centerX = canvas.width / 2;
    const baseRadius = 40;       // Average radius
    const waveAmplitude = 7;     // Height of wave peaks and troughs
    const waveFrequency = 7;     // Number of waves

    ctx.beginPath();
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.01) {
        const r = baseRadius + waveAmplitude * Math.sin(angle * waveFrequency);
        const x = centerX + r * Math.cos(angle);
        const y = height - 170 + r * Math.sin(angle);
        if (angle === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.fill();


    // Badge in center
    ctx.beginPath();
    ctx.arc(width / 2, height - 170, 30, 0, Math.PI * 2);
    ctx.fillStyle = secondary;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width / 2, height - 170, 30, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    drawStar(ctx, width / 2, height - 170, 5, 20, 10, '#fff');
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  let step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawCorners(ctx, width, height, accent, primary) {
   ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(1, 1); ctx.lineTo(1, 120); ctx.lineTo(120, 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = primary; //blue
    ctx.beginPath();
    ctx.moveTo(1, 120); ctx.lineTo(60, 60); ctx.lineTo(60, 120); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(120, 59); ctx.lineTo(60, 59); ctx.lineTo(60, 120); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(60, 60); ctx.lineTo(280,1); ctx.lineTo(120, 1);ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(60, 59); ctx.lineTo(280, 0); ctx.lineTo(200, 59); ctx.closePath(); ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(width-1, height-1); ctx.lineTo(width - 120, height-1); ctx.lineTo(width-1, height - 120); ctx.closePath(); ctx.fill();
    ctx.fillStyle = primary;//blue
    ctx.beginPath();
    ctx.moveTo(width-1, height - 120); ctx.lineTo(width - 60, height - 60); ctx.lineTo(width - 60, height - 120); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(width - 60, height - 59); ctx.lineTo(width - 60, height - 120); ctx.lineTo(width - 120, height - 59); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(width - 60, height - 60); ctx.lineTo(width - 280, height-1); ctx.lineTo(width - 120, height-1);ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(width - 60, height - 59); ctx.lineTo(width - 280, height); ctx.lineTo(width - 200, height - 59); ctx.closePath(); ctx.fill();

}

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating certificate image.");
  }
};

module.exports = { getCertificate };

