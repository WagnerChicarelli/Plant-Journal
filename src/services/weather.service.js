const CACHE_DURATION_MS = 30 * 60 * 1000;
const cache = new Map();

export async function getWeather(latitude, longitude) {
  const cacheKey = `${latitude},${longitude}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro ao buscar clima: ${response.status}`);
  }

  const data = await response.json();

  const result = {
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
    recommendation: generateRecommendation(data)
  };

  cache.set(cacheKey, { data: result, timestamp: Date.now() });

  return result;
}

function generateRecommendation(data) {
  const humidity = data.current.relative_humidity_2m;
  const precipitation = data.daily.precipitation_probability_max[0];
  const temp = data.current.temperature_2m;

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
