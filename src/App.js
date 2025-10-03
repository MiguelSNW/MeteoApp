import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [ciudad, setCiudad] = useState("Cargando ciudad...");
  const [grados, setGrados] = useState("");
  const [icono, setIcono] = useState("");
  const [prevision, setPrevision] = useState([]);
  const [ciudadBuscada, setCiudadBuscada] = useState("");
  const [necesitaPermiso, setNecesitaPermiso] = useState(false);

  const API_KEY = "540b9a83b121afb1ddbd36ea51d9a72a";

  // ---- FUNCIONES REUTILIZABLES ----
  const obtenerClima = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
      );
      if (!res.ok) throw new Error("Error al obtener datos del clima");
      const data = await res.json();
      setCiudad(data.name);
      setGrados(`${Math.round(data.main.temp)}°C`);
      setIcono(
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
      );
    } catch (err) {
      console.error("Error obteniendo clima:", err);
    }
  };

  const obtenerPrevision = async (lat, lon) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max&timezone=Europe/Madrid`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error obteniendo datos");
    const data = await res.json();
    return data.daily;
  };

  const pedirUbicacion = () => {
    if (!navigator.geolocation) {
      console.error("Geolocalización no soportada");
      setCiudad("Geolocalización no soportada");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await obtenerClima(latitude, longitude);
        const previsiones = await obtenerPrevision(latitude, longitude);
        setPrevision(previsiones);
        setNecesitaPermiso(false); // ya no necesitamos botón
      },
      (err) => {
        console.error("Error de geolocalización:", err.message);
        setNecesitaPermiso(true); // si falla, mostramos el botón
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Intento automático al cargar
  useEffect(() => {
    pedirUbicacion();
  }, []);

  const buscarCiudad = async () => {
    if (!ciudadBuscada) return;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${ciudadBuscada}&limit=1&appid=${API_KEY}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        await obtenerClima(lat, lon);
        const previsiones = await obtenerPrevision(lat, lon);
        setPrevision(previsiones);
      } else {
        console.error("Ciudad no encontrada");
      }
    } catch (err) {
      console.error("Error buscando ciudad:", err);
    }
  };

  // ---- RENDER ----
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
        {/* Botón extra si Safari bloquea */}
        {necesitaPermiso && (
          <button className="btn btn-light mb-3" onClick={pedirUbicacion}>
            Permitir ubicación
          </button>
        )}

        {/* Ciudad y temperatura */}
        <div className="ciudad-temperatura">
          <span className="nombre-ciudad">{ciudad}</span>
          <span className="temperatura">
            {grados}
            {icono && (
              <img
                src={icono}
                alt="icono del clima"
                className="icono-principal"
              />
            )}
          </span>
        </div>

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
