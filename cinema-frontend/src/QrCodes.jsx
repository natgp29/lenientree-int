import { QRCodeCanvas } from "qrcode.react";

const seats = [
  {
    theatre: "Demo Cinema",
    screen: "Screen 1",
    seat: "A1",
    token: "cinema-seat-a1-demo",
  },
  {
    theatre: "Demo Cinema",
    screen: "Screen 1",
    seat: "A2",
    token: "demo-s1-a2",
  },
  {
    theatre: "Demo Cinema",
    screen: "Screen 2",
    seat: "A1",
    token: "demo-s2-a1",
  },
  {
    theatre: "Grand Cinema",
    screen: "Screen 1",
    seat: "A1",
    token: "grand-s1-a1",
  },
];

function QrCodes() {
  const frontendUrl = "http://192.168.1.6:5173";

  return (
    <div style={{ padding: "30px" }}>
      <h1>Cinema Seat QR Codes</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "30px",
          marginTop: "30px",
        }}
      >
        {seats.map((seat) => {
          const url = `${frontendUrl}/?token=${seat.token}`;

          return (
            <div
              key={seat.token}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <h2>{seat.theatre}</h2>
              <p>{seat.screen}</p>
              <h3>Seat {seat.seat}</h3>

              <QRCodeCanvas value={url} size={200} />

              <p style={{ fontSize: "12px" }}>{url}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default QrCodes;