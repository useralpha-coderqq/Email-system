require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI);

const Ticket = mongoose.model("Ticket", {
  _id: String,
  data: Object,
  theme: String
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));


// TEMP storage
const tickets = {};

// 👇 ADD THIS HERE (top of file, after imports)

function formatDate(dateStr, timeStr) {
  const d = new Date(`${dateStr}T${timeStr}`);

  const options = { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'long' 
  };

  const datePart = d.toLocaleDateString('en-IN', options);
  const timePart = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `${datePart} | ${timePart}`;
}

// TEMPLATE FUNCTION

function generateTemplate(data = {}, id = "", theme = "red") {

  if (theme === "purple") {
    return generatePurpleTemplate(data, id);
  }

  return generateRedTemplate(data, id);
}


// ---------------- RED TEMPLATE ----------------
function generateRedTemplate(data = {}, id = "") {

  const color = "#F84464";
  const formattedDate = formatDate(
    data.date || "",
    data.time || ""
  );

  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="background:#f4f4f4;padding:30px 12px;font-family:Arial,sans-serif">

<tr>
<td align="center">

<table width="420" cellpadding="0" cellspacing="0" border="0"
style="max-width:420px;background:#ffffff;border-radius:22px;overflow:hidden">

<tr>
<td style="padding:18px">

<table width="100%">
<tr>

<td width="90" valign="top">
<img src="${data.image || ""}"
style="width:78px;height:108px;border-radius:12px;display:block;object-fit:cover">
</td>

<td valign="top">

<div style="font-size:18px;font-weight:700;color:#222;line-height:1.4">
${data.matchName || ""}
</div>

<div style="font-size:14px;color:#666;margin-top:5px">
Cricket | English
</div>

<div style="font-size:16px;font-weight:bold;color:#333;margin-top:14px">
${formattedDate}
</div>

<div style="font-size:14px;color:#777;margin-top:6px">
${data.stadium || ""}
</div>

<div style="font-size:15px;font-weight:bold;color:#333;margin-top:6px">
${data.tickets || 0} ticket(s): ${data.stand || ""}
</div>

</td>

</tr>
</table>

</td>
</tr>

<tr>
<td style="border-top:1px solid #e5e5e5;padding:14px 16px;text-align:center">

<span style="
background:#0aa52f;
color:#fff;
font-weight:bold;
padding:12px 22px;
border-radius:4px;
font-size:14px;
display:inline-block;">
CONFIRMED
</span>

<span style="margin-left:12px;color:#666;font-size:15px">
Enjoy the match!
</span>

</td>
</tr>

<tr>
<td style="padding:16px;border-top:2px dotted #ddd">

<a href="https://email-system-l2ix.onrender.com/ticket/${id}"
style="
display:block;
text-align:center;
background:${color};
color:#fff;
text-decoration:none;
padding:14px;
border-radius:10px;
font-size:15px;
font-weight:bold;">
View Details
</a>

</td>
</tr>

<tr>
<td style="border-top:1px solid #e5e5e5;padding:16px;font-size:14px;color:#555">

<table width="100%">
<tr>
<td width="50%" align="center">
Re-send confirmation
</td>
<td width="50%" align="center" style="color:#999">
Cancellation unavailable for Live Events
</td>
</tr>
</table>

</td>
</tr>

</table>

</td>
</tr>
</table>
`;
}


// ---------------- PURPLE TEMPLATE ----------------
function generatePurpleTemplate(data = {}, id = "") {

  // ✅ Safe getter (prevents undefined everywhere)
  const safe = (val, fallback = "") => {
    if (val === undefined || val === null || val === "") return fallback;
    return val;
  };

  const formattedDate = formatDate(
    safe(data.date, ""),
    safe(data.time, "")
  );

  const mapLink = (data.lat && data.lng)
    ? `https://www.google.com/maps?q=${data.lat},${data.lng}`
    : "#";

  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:20px;font-family:Arial">

<tr>
<td align="center">

<table width="360" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:18px;overflow:hidden;color:#fff">

<!-- HEADER -->
<tr>
<td style="background:linear-gradient(90deg,#6C3BFF,#8E5BFF);padding:14px 16px;font-weight:bold;font-size:15px">
district
<span style="float:right;background:#0f0f10;padding:6px 10px;border-radius:8px;font-size:12px">
${safe(id, "").slice(0,6).toUpperCase()}
</span>
</td>
</tr>

<!-- MATCH CARD -->
<tr>
<td style="padding:14px">

<div style="background:#0f0f10;border-radius:12px;padding:12px">

<table width="100%">
<tr>

<td width="40" align="left">
<img src="${safe(data.team1Logo)}" width="34" height="34" style="object-fit:contain">
</td>

<td align="center" style="font-size:13px;font-weight:bold;line-height:1.4">
${safe(data.matchNumber)} ${safe(data.matchName)}
</td>

<td width="40" align="right">
<img src="${safe(data.team2Logo)}" width="34" height="34" style="object-fit:contain">
</td>

</tr>
</table>

<div style="font-size:12px;color:#aaa;text-align:center;margin-top:6px">
${formattedDate || "Date & Time TBA"} · ${safe(data.city)}
</div>

</div>

</td>
</tr>

<!-- CONFIRMATION -->
<tr>
<td style="padding:0 16px">

<div style="color:#b388ff;font-weight:bold;font-size:14px">
Your booking is confirmed!
</div>

<div style="font-size:12px;color:#aaa;margin-top:6px;line-height:1.5">
Hey ${safe(data.customerName, "Guest")}, thank you for purchasing tickets. Please remember to carry a valid photo ID with you.
</div>

</td>
</tr>

<!-- INFO BOX -->
<tr>
<td style="padding:14px 16px">

<div style="background:#1e1b2e;border-radius:12px;padding:12px;font-size:12px;color:#ccc;line-height:1.5;border-left:3px solid #8E5BFF">

Entry will be through the QR code, which will be available on your District app closer to the event.<br><br>

Access your tickets from your profile in the District app and make sure you're logged in!

</div>

</td>
</tr>

<!-- TICKETS -->
<tr>
<td style="padding:14px 16px">

<div style="background:#0f0f10;border-radius:12px;padding:14px;border:1px solid #222">

<div style="font-weight:bold;font-size:14px;margin-bottom:10px">
${safe(data.tickets, 0)} Tickets
</div>

<div style="border-top:1px solid #26262a;padding-top:10px">

<div style="font-size:13px;font-weight:bold">
${safe(data.stand, "Stand Not Assigned")}
</div>

<div style="font-size:12px;color:#aaa;margin-top:6px">
• Each ticket grants entry to one individual.<br>
• Ticket prices are inclusive of all applicable entertainment tax and GST.
</div>

<div style="font-size:12px;color:#aaa;margin-top:8px">
Seat No. ${safe(data.seat, "Auto")}
</div>

</div>

<div style="border-top:1px solid #26262a;margin-top:12px;padding-top:10px;font-size:12px;color:#aaa">
${formattedDate || ""}
</div>

</div>

</td>
</tr>

<!-- VENUE -->
<tr>
<td style="padding:14px 16px">

<div style="font-size:11px;color:#777;margin-bottom:4px">Venue</div>

<div style="font-size:13px;font-weight:bold">
${safe(data.venue, "Venue TBA")}
</div>

<br>

<a href="${mapLink}"
style="display:inline-block;padding:10px 14px;border:1px solid #555;border-radius:10px;color:#fff;text-decoration:none;font-size:12px">
Get Directions
</a>

</td>
</tr>

<!-- USER -->
<tr>
<td style="padding:14px 16px">

<div style="font-size:11px;color:#777;margin-bottom:4px">Purchased by</div>

<div style="font-size:13px;font-weight:bold">
${safe(data.customerName, "Guest")}
</div>

<div style="font-size:12px;color:#aaa;margin-top:4px">
${safe(data.phone, "N/A")}
</div>

</td>
</tr>

<!-- VIEW BUTTON -->
<tr>
<td style="padding:10px 16px">

<a href=" https://email-system-l2ix.onrender.com/ticket/${id}"
style="display:block;text-align:center;border:1px solid #8E5BFF;padding:12px;border-radius:12px;color:#b388ff;text-decoration:none;font-weight:bold">
View Tickets
</a>

</td>
</tr>

<!-- PRICE -->
<tr>
<td style="padding:14px 16px 20px">

<div style="font-size:11px;color:#777">Paid</div>

<div style="font-size:18px;font-weight:bold;margin-top:4px">
₹${safe(data.total, 0)}
</div>

</td>
</tr>

</table>

</td>
</tr>
</table>
`;
}

// SEND EMAIL
app.post("/send-email", async (req, res) => {
  const { to, data, theme } = req.body;

  if (!to) return res.status(400).json({ error: "Email required" });

  const id = uuidv4();
   
  console.log(id);
  await Ticket.create({ _id: id, data, theme: theme || "red"});

  const html = generateTemplate(data, id, theme);

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.SENDER_EMAIL,
          name: "Ticket System"
        },
        to: [{ email: to }],
        subject: "Booking Confirmed",
        htmlContent: html
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ success: true, link: `http://localhost:3000/ticket/${id}` });

    console.log("Saved Theme:", theme);

  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: "Email failed" });
  }
});

// LANDING PAGE
app.get("/ticket/:id", async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.send("Invalid ticket");

  const data = ticket.data;
  const theme = ticket.theme || "red"; // ✅ FIX: get theme from DB

  // ✅ Purple landing page
  if (theme === "purple") {
    return res.send(generatePurpleLanding(data, req.params.id));
  }

  // 🔴 Default red landing page
  const formattedDate = formatDate(data.date, data.time);

  console.log("DB THEME:", ticket.theme);


  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
body{
    margin:0;
    padding:20px;
    background:#f3f3f3;
    font-family:Arial;
}

.ticket-wrapper{
    max-width:380px;
    margin:auto;
    position:relative;
}

.match-card{
    background:white;
    border-radius:18px;
    padding:14px;
    display:flex;
    align-items:flex-start;
    gap:12px;
    box-shadow:0 2px 10px rgba(0,0,0,0.08);
}

.match-left img{
    width:75px;
    height:105px;
    border-radius:10px;
    object-fit:cover;
}

.match-info h3{
    font-size:15px;
    margin:0 0 5px;
    font-weight:700;
}

.match-info p{
    font-size:12px;
    margin:2px 0;
    color:#666;
}

.ticket-label{
    writing-mode:vertical-rl;
    font-size:11px;
    color:#888;
    margin-left:auto;
}

.toggle-btn{
    width:100%;
    margin:14px 0;
    border:none;
    padding:13px;
    border-radius:30px;
    background:#e9e6e6;
    font-size:14px;
    font-weight:600;
    cursor:pointer;
}

.ticket-box{
    background:white;
    border-radius:18px;
    padding:15px;
    border:1px solid #eee;
    position:relative;
}

.ticket-box::before,
.ticket-box::after{
    content:'';
    position:absolute;
    width:22px;
    height:22px;
    background:#f3f3f3;
    border-radius:50%;
    top:55%;
    transform:translateY(-50%);
}

.ticket-box::before{ left:-11px; }
.ticket-box::after{ right:-11px; }

.ticket-box hr{
    border:none;
    border-top:2px dotted #ddd;
    margin:18px 0;
}

.stand-title{
    text-align:center;
    font-size:12px;
    font-weight:bold;
    color:#666;
    margin-bottom:15px;
}

.qr-section{
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:20px;
}

.arrow-btn{
    width:30px;
    height:30px;
    border:none;
    border-radius:8px;
    background:#efefef;
    font-size:18px;
    color:#999;
}

.qr-box{
    position:relative;
    width:180px;
    margin:auto;
    text-align:center;
}

.qr-box img{
    width:100%;
    opacity:0.15;
}

.qr-overlay{
    position:absolute;
    inset:0;
    background:white;
    display:flex;
    align-items:center;
    justify-content:center;
    text-align:center;
    padding:15px;
}

.qr-overlay p{
    font-size:14px;
    font-weight:bold;
    color:#1f2d7a;
    line-height:1.5;
}

.ticket-details{
    background:#fafafa;
    border-radius:14px;
    padding:12px;
}

.row{
    display:flex;
    justify-content:space-between;
    margin-bottom:10px;
    font-size:12px;
}

.row span{ color:#999; }

.row strong{
    max-width:55%;
    text-align:right;
    font-weight:600;
}

.cancel-note{
    text-align:center;
    font-size:11px;
    color:#888;
    margin:15px 0;
}

.price-box{
    background:white;
    border-radius:14px;
    padding:15px;
    box-shadow:0 2px 10px rgba(0,0,0,0.06);
    position:relative;
}

.price-box::before,
.price-box::after{
    content:'';
    position:absolute;
    width:22px;
    height:22px;
    background:#f3f3f3;
    border-radius:50%;
    top:-11px;
}

.price-box::before{ left:-11px; }
.price-box::after{ right:-11px; }

.price-row{
    display:flex;
    justify-content:space-between;
    font-size:12px;
    margin-bottom:8px;
}
</style>
</head>

<body>

<div class="ticket-wrapper">

<!-- MATCH CARD -->
<div class="match-card">
    <div class="match-left">
        <img src="${data.image}">
    </div>

    <div class="match-info">
        <h3>${data.matchName}</h3>
        <p>Cricket | English</p>
        <p>${formattedDate}</p>
        <p>${data.stadium}</p>
    </div>

    <div class="ticket-label">M-Ticket</div>
</div>

<button class="toggle-btn" onclick="toggleTicket()">View Details</button>

<div id="ticketDetails" style="display:none;">

    <div class="ticket-box">

        <div class="stand-title">
            ${data.stand}
        </div>

        <div class="qr-section">

            <button class="arrow-btn">&#10094;</button>

            <div class="qr-box">

                <div class="qr-overlay">
                    <p>QR will be visible before match starts</p>
                </div>

                <!-- STATIC QR -->
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.id}">
            </div>

            <button class="arrow-btn">&#10095;</button>

        </div>

        <hr>

        <div class="ticket-details">
            <div class="row">
                <span>Enter From</span>
                <strong>Main Gate</strong>
            </div>
            
            <div class="row">
                <span>Main Gate</span>
                <strong>3</strong>
            </div>

            <div class="row">
                <span>Staircase</span>
                <strong>${data.Staircase || "1"}</strong>
            </div>

            <div class="row">
                <span>Level</span>
                <strong>${data.level || "Auto Assigned"}</strong>
            </div>
        </div>

    </div>

    <p class="cancel-note">Cancellation unavailable for Live Events</p>

    <div class="price-box">
        <div class="price-row">
            <span>Total</span>
            <strong>₹${data.total}</strong>
        </div>

        <div class="price-row">
            <span>Tickets Price(${data.tickets})</span>
            <strong>₹${data.price}</strong>
        </div>

        <div class="price-row">
            <span>Convenience fees</span>
            <strong>₹${data.fees}</strong>
        </div>
    </div>

</div>

</div>

<script>
function toggleTicket(){
    let details = document.getElementById("ticketDetails");
    let btn = document.querySelector(".toggle-btn");

    if(details.style.display === "none"){
        details.style.display = "block";
        btn.innerText = "Tap to hide details";
    }else{
        details.style.display = "none";
        btn.innerText = "View Details";
    }
}
</script>

</body>
</html>
`);
});


function generatePurpleLanding(data = {}, id = "") {


  const formattedDate = formatDate(
    data.date || "",
    data.time || ""
  );

  const tickets = Number(data.tickets) || 1;

  const qrList = Array.from({ length: tickets }, (_, i) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${id}-${i}-${Math.random()}`;
  });

  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
*{ box-sizing:border-box; }

body{
  margin:0;
  font-family: system-ui, -apple-system;
  background: radial-gradient(circle at top, #0f3d2b, #000);
  color:#fff;
}

.container{
  max-width:420px;
  margin:auto;
  padding:16px;
}

/* HEADER */
.check{
  width:70px;
  height:70px;
  background:#38d27a;
  border-radius:50%;
  margin:40px auto 12px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:30px;
}

.title{
  text-align:center;
  font-size:22px;
  font-weight:600;
  margin-bottom:20px;
}

/* CARD */
.card{
  background:#1c1c1e;
  border-radius:20px;
  padding:16px;
  margin-bottom:16px;
}

/* DATE BLOCK */
.date{
  font-weight:600;
  font-size:15px;
}

.mticket{
  margin-top:10px;
  font-size:13px;
  color:#aaa;
}

/* SECTION */
.section{
  text-align:center;
  letter-spacing:3px;
  color:#888;
  margin:20px 0 10px;
  font-size:12px;
}

/* QR SLIDER */
.qr-wrapper{
  position:relative;
  overflow:hidden;
  border-radius:22px;
  background:#fff;
  padding:20px 0;
}

.qr-slider{
  display:flex;
  transition:transform 0.35s ease;
  will-change: transform;
}

.qr-slide{
  min-width:100%;
  display:flex;
  justify-content:center;
}

.qr-slide img{
  width:230px;
}

/* PURPLE BORDER */
.qr-wrapper::after{
  content:"";
  position:absolute;
  inset:-2px;
  border-radius:24px;
  border:2px solid #7a3cff;
  pointer-events:none;
}

/* NAV BUTTONS */
.nav{
  position:absolute;
  top:50%;
  transform:translateY(-50%);
  background:#000;
  border:none;
  color:#fff;
  padding:6px 10px;
  border-radius:8px;
  opacity:0.7;
}

.left{ left:6px; }
.right{ right:6px; }

.counter{
  text-align:center;
  color:#aaa;
  font-size:13px;
  margin-bottom:10px;
}

/* VENUE */
.venue-title{
  font-weight:600;
}

.small{
  color:#aaa;
  font-size:13px;
}

/* ORDER */
.info{
  margin-top:6px;
  font-size:14px;
}
</style>
</head>

<body>

<div class="container">

<div class="check">✓</div>
<div class="title">Booking is Confirmed</div>

<!-- DATE CARD -->
<div class="card">
  <div class="date">
    ${formattedDate}
  </div>

  <div class="mticket">
    M-Ticket: Show the QR at the gate for entry
  </div>
</div>

<!-- QR -->
<div class="section">M - TICKETS</div>

<div class="card">

  <div class="counter" id="count">
    Ticket 1 / ${tickets}
  </div>

  <div class="qr-wrapper">

    

    <div class="qr-slider" id="slider">
      ${qrList.map(qr => `
        <div class="qr-slide">
          <img src="${qr}">
        </div>
      `).join("")}
    </div>

  </div>

  <div class="small" style="text-align:center;margin-top:10px;">
    Confirmation code: <b>${id.slice(0,6).toUpperCase()}</b>
  </div>

</div>

<!-- VENUE -->
<div class="section">VENUE</div>

<div class="card">
  <div class="venue-title">${data.stadium || ""}</div><br>
  <div class="small">${data.venue || ""}</div>
</div>

<!-- ORDER -->
<div class="section">ORDER DETAILS</div>

<div class="card">
  <div class="info"> Name - ${data.customerName || ""}</div><br>
  <div class="info"> Phone No. - ${data.phone || ""}</div>
</div>

<!-- HELP -->
<div class="section">NEED HELP WITH BOOKING</div>

<div class="card">
  <div>Chat with support</div>
  <div style="height:1px;background:#2a2a2a;margin:10px 0;"></div>
  <div>Terms and conditions</div>
</div>

</div>

<script>
let index = 0;
const slider = document.getElementById("slider");
const count = document.getElementById("count");

function update(){
  slider.style.transform = "translateX(-" + (index * 100) + "%)";
  count.innerText = "Ticket " + (index+1) + " / ${tickets}";
}

function next(){
  if(index < ${tickets - 1}) index++;
  update();
}

function prev(){
  if(index > 0) index--;
  update();
}

/* TOUCH FIX (important) */
let startX = 0;

slider.addEventListener("touchstart", e=>{
  startX = e.touches[0].clientX;
});

slider.addEventListener("touchend", e=>{
  let endX = e.changedTouches[0].clientX;

  if(startX - endX > 50) next();
  if(endX - startX > 50) prev();
});
</script>

</body>
</html>
`;
}



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
