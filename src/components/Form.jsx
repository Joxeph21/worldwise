import { useEffect, useState } from "react";
import Button from "./Button";
import styles from "./Form.module.css";
import DatePicker from "react-datepicker";
import BackButton from "./BackButton";
import { useURLPosition } from "../Hooks/useURLPosition";
import { useCities } from "../contexts/CityContexts";
import Message from "./Message";
import Spinner from "./Spinner";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const { mapLat, mapLng } = useURLPosition();
  const [emoji, setEmoji] = useState("");
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [geoError, setGeoError] = useState(false);

  const { createCity, isLoading } = useCities();

  const GEO_BASE_URL =
    "https://api.bigdatacloud.net/data/reverse-geocode-client";

  useEffect(() => {
    if (!mapLat && !mapLng) return;
    async function fetchCityData() {
      try {
        setIsLoadingGeo(true);
        const res = await fetch(
          `${GEO_BASE_URL}?latitude=${mapLat}&longitude=${mapLng}`
        );
        const data = await res.json();

        if (!data.countryCode)
          throw new Error(`That doesn't look like a country ☹️`);

        setCityName(data.city || data.locality || "");
        setCountry(data.countryName);
        setEmoji(convertToEmoji(data.countryCode));
        setGeoError(false);
      } catch (err) {
        setGeoError(false);
      } finally {
        setIsLoadingGeo(false);
      }
    }
    fetchCityData();
  }, [mapLat, mapLng]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat: Number(mapLat), lng: Number(mapLng) },
    };
    await createCity(newCity);
    navigate('/app/cities');
  }



  if (isLoadingGeo) return <Spinner />;

  if (!mapLat && !mapLng)
    return (
      <Message
        message={
          "🫷Holl up, Seems like no Country has been selected. Start by clicking anywhere on the map or Use your Location🙃"
        }
      />
    );

  if (geoError) return <Message message={geoError} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {country}?</label>

        <DatePicker
          id="date"
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat={"dd/MM/yyyy"}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type={"primary"}>Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
