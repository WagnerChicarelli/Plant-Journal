/**
 * Serviço de clima com fallback automático.
 *
 * Estratégia:
 * 1. Tenta usar WeatherAPI (requer chave de API)
 * 2. Se falhar (chave inválida, limite atingido, erro de rede),
 *    usa Open-Meteo como backup (gratuita, sem chave)
 *
 * Isso garante que a funcionalidade de clima sempre funcione,
 * mesmo se a chave do WeatherAPI expirar ou atingir o limite
 * de 1.000.000 de requisições mensais.
 *
 * Para configurar a WeatherAPI:
 * 1. Crie uma conta em https://www.weatherapi.com/
 * 2. Obtenha sua API Key
 * 3. Adicione no arquivo .env: WEATHER_API_KEY=sua_chave_aqui
 */

const CACHE_DURATION_MS = 30 * 60 * 1000;
const cache = new Map();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

export async function getWeather(latitude, longitude) {
  const cacheKey = `${latitude},${longitude}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data;
  }

  let result;

  try {
    result = await getWeatherFromWeatherAPI(latitude, longitude);
  } catch (error) {
    console.warn(`WeatherAPI falhou (${error.message}), usando Open-Meteo como backup.`);
    result = await getWeatherFromOpenMeteo(latitude, longitude);
  }

  cache.set(cacheKey, { data: result, timestamp: Date.now() });

  return result;
}

async function getWeatherFromWeatherAPI(latitude, longitude) {
  if (!WEATHER_API_KEY) {
    throw new Error('WEATHER_API_KEY não configurada');
  }

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&days=1&aq=no&alerts=no`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`WeatherAPI retornou status ${response.status}`);
  }

  const data = await response.json();

  return {
    current: {
      temperature: data.current.temp_c,
      humidity: data.current.humidity,
      precipitation: data.current.precipitation_mm,
      weatherCode: data.current.condition.code,
      description: data.current.condition.text
    },
    daily: {
      maxTemp: data.forecast.forecastday[0].day.maxtemp_c,
      minTemp: data.forecast.forecastday[0].day.mintemp_c,
      precipitationSum: data.forecast.forecastday[0].day.totalprecip_mm,
      precipitationProbability: data.forecast.forecastday[0].day.daily_chance_of_rain
    },
    source: 'weatherapi',
    recommendation: generateRecommendation({
      humidity: data.current.humidity,
      precipitation: data.forecast.forecastday[0].day.daily_chance_of_rain,
      temp: data.current.temp_c
    })
  };
}

async function getWeatherFromOpenMeteo(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Meteo retornou status ${response.status}`);
  }

  const data = await response.json();

  return {
    current: {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      weatherCode: data.current.weather_code
    },
    daily: {
      maxTemp: data.daily.temperature_2m_max[0],
      minTemp: data.daily.temperature_2m_min[0],
      precipitationSum: data.daily.precipitation_sum[0],
      precipitationProbability: data.daily.precipitation_probability_max[0]
    },
    source: 'open-meteo',
    recommendation: generateRecommendation({
      humidity: data.current.relative_humidity_2m,
      precipitation: data.daily.precipitation_probability_max[0],
      temp: data.current.temperature_2m
    })
  };
}

function generateRecommendation({ humidity, precipitation, temp }) {
  if (precipitation > 70) {
    return 'Evite regar — alta probabilidade de chuva.';
  }

  if (humidity > 80) {
    return 'Umidade alta — rega pode não ser necessária.';
  }

  if (temp > 35) {
    return 'Temperatura alta — rega recomendada.';
  }

  if (humidity < 30) {
    return 'Umidade baixa — rega recomendada.';
  }

  return 'Condições normais — siga a frequência de rega.';
}

export function clearCache() {
  cache.clear();
}
