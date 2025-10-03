import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [ubicacion, setUbicacion] = useState("Cargando...");
  const [ciudad, setCiudad] = useState("Cargando ciudad...");
  const [grados, setGrados] = useState("");
  const [icono, setIcono] = useState("");
  const [prevision, setPrevision] = useState([]);
  const [error, setError] = useState(null);
  const [ciudadBuscada, setCiudadBuscada] = useState("");
  const [latLon, setLatLon] = useState({ lat: null, lon: null });
  const API_KEY = "540b9a83b121afb1ddbd36ea51d9a72a";

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=es`
            );
            if (!res.ok) throw new Error("Error al obtener datos del clima");

            const data = await res.json();
            setUbicacion(
              `${data.name}, ${data.sys.country} — ${data.weather[0].description}, ${data.main.temp}°C`
            );
            setCiudad(data.name);
            setGrados(`${Math.round(data.main.temp)}°C`);
            setIcono(
              `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
            );

            const previsiones = await obtenerPrevision(latitude, longitude);
            setPrevision(previsiones);
          } catch (err) {
            console.error(err);
            setError("Error al obtener datos de la API de clima.");
          }
        },
        (err) => {
          setError(`Error de geolocalización: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocalización no soportada por este navegador.");
    }

    async function obtenerPrevision(lat, lon) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max&timezone=Europe/Madrid`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error obteniendo datos");
      const data = await res.json();
      return data.daily;
    }
  }, []);

  const buscarCiudad = async () => {
    if (!ciudadBuscada) return;

    const API_KEY = "540b9a83b121afb1ddbd36ea51d9a72a";
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${ciudadBuscada}&limit=1&appid=${API_KEY}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        setLatLon({ lat, lon });
        console.log("Latitud:", lat, "Longitud:", lon);

        // Aquí puedes llamar a la API del clima con esas coordenadas
        obtenerClima(lat, lon);

        const previsiones = await obtenerPrevision(lat, lon);
        setPrevision(previsiones);

        async function obtenerPrevision(lat, lon) {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max&timezone=Europe/Madrid`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Error obteniendo datos");
          const data = await res.json();
          return data.daily;
        }
      } else {
        console.error("Ciudad no encontrada");
      }
    } catch (err) {
      console.error("Error buscando ciudad", err);
    }
  };

  const obtenerClima = async (lat, lon) => {
    const API_KEY = "540b9a83b121afb1ddbd36ea51d9a72a";
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
      );
      const data = await res.json();
      setCiudad(data.name);
      setGrados(`${Math.round(data.main.temp)}°C`);
      setIcono(
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
      );
    } catch (err) {
      console.error("Error obteniendo clima", err);
    }
  };

  return (
    <div
      className="container-fluid p-3 d-flex flex-column align-items-center"
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage:
          "url('https://images.pexels.com/photos/39811/pexels-photo-39811.jpeg?cs=srgb&dl=pexels-veeterzy-39811.jpg&fm=jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Input de búsqueda */}
      <div className="input-buscador-container">
        <input
          type="text"
          placeholder="Introduzca una ciudad..."
          className="form-control input-buscador"
          value={ciudadBuscada}
          onChange={(e) => setCiudadBuscada(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscarCiudad()}
        />
        <span
          className="input-group-text buscador-icono"
          style={{ cursor: "pointer" }}
          onClick={buscarCiudad}
        >
          <i className="bi bi-geo-alt"></i>
        </span>
      </div>

      {/* Texto de ubicación */}
      <div
        className="text-center"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "90%",
          fontSize: "3vw",
          fontWeight: "bold",
          margin: "auto",
          border: "2px solid white",
          borderRadius: "15px",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          padding: "20px",
          color: "white",
        }}
      >
        {/* Ciudad y temperatura */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "2.5vw", fontWeight: "500" }}>{ciudad}</span>
          <span
            style={{
              fontSize: "1.5vw",
              display: "flex",
              alignItems: "center",
              fontWeight: "700",
            }}
          >
            {grados}
            {icono && (
              <img
                src={icono}
                alt="icono del clima"
                style={{
                  marginLeft: "10px",
                  width: "40px",
                  height: "40px",
                }}
              />
            )}
          </span>
        </span>

        {/* Previsión de 7 días */}
        <div style={{ marginTop: "20px", width: "100%" }}>
          <h3
            style={{
              color: "white",
              textAlign: "center",
              marginBottom: "15px",
            }}
          >
            Previsión en 7 días
          </h3>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {prevision && prevision.time && prevision.time.length > 0
              ? prevision.time.slice(0, 7).map((fecha, index) => {
                  const dia = new Date(fecha);
                  const opciones = { weekday: "short" };
                  const diaSemana = dia.toLocaleDateString("es-ES", opciones);

                  const iconCode = prevision.weathercode[index];
                  let iconUrl = `https://openweathermap.org/img/wn/01d@2x.png`;
                  if (iconCode === 1)
                    iconUrl = "https://openweathermap.org/img/wn/02d@2x.png";
                  if (iconCode === 2)
                    iconUrl = "https://openweathermap.org/img/wn/03d@2x.png";
                  if (iconCode === 3)
                    iconUrl = "https://openweathermap.org/img/wn/04d@2x.png";

                  return (
                    <div
                      key={index}
                      className="card clima-card text-center p-2"
                    >
                      <h6 className="clima-dia">{diaSemana}</h6>
                      <img
                        src={iconUrl}
                        alt="icono del clima"
                        className="icono-clima"
                      />
                      <p className="clima-temp">
                        {Math.round(prevision.temperature_2m_max[index])}° /{" "}
                        {Math.round(prevision.temperature_2m_min[index])}°
                      </p>

                      {/* Viento */}
                      <div className="d-flex align-items-center justify-content-center gap-1 mt-2">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/414/414927.png"
                          alt="icono viento"
                          className="icono-viento"
                        />
                        <span className="clima-viento">
                          {prevision.windspeed_10m_max
                            ? `${Math.round(
                                prevision.windspeed_10m_max[index]
                              )} km/h`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  );
                })
              : [...Array(7)].map((_, index) => (
                  <div key={index} className="card clima-card text-center p-2">
                    <h6>Cargando...</h6>
                  </div>
                ))}
          </div>
        </div>
      </div>

      <span style={{ fontSize: "16px", color: "white" }}>
        Powered by OpenWeather API
      </span>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
