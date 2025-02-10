interface MeasureResponse {
  request: any;
  indices: any;
  data: {
    [stationId: string]: {
      [timestamp: string]: [number, number, number, string, string];
    };
  };
}

interface Measurement {
  timestamp: string;
  value: number;
}
