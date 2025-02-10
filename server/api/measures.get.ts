export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const stationId = "1639"; // ID of station 'Radebeul-Wahnsdorf'

  const params = new URLSearchParams({
    date_from: query.startDate as string,
    date_to: query.endDate as string,
    time_from: '9',
    time_to: '9',
    station: stationId,
    component: '3',       // ID of component 'O3',
    scope: '2'            // ID: Stundenmittelwert
  });

  let response;
  try {
    response = await $fetch<MeasureResponse>(`${config.baseURL}/measures/json?${params.toString()}`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    });
  } catch (error) {
    console.error('Error fetching measures:', error);
    throw new Error('Failed to fetch measures');
  }

  if (!response.data[stationId]) {
    console.error('No data for station', stationId);
    return [];
  }

  // Daten umwandeln in nutzbares Format
  const rawData = response.data[stationId];


// Konvertieren in Array [{ timestamp, value }]
  return Object.entries(rawData).map(([timestamp, values]): Measurement => ({
    timestamp,
    value: values[2] // Index 2 ist der Messwert
  }));
});
