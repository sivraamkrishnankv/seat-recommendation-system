declare module "suncalc" {
  const SunCalc: {
    getPosition(date: Date, lat: number, lon: number): { azimuth: number; altitude: number };
    getTimes(
      date: Date,
      lat: number,
      lon: number
    ): {
      sunrise: Date;
      sunset: Date;
      sunriseEnd?: Date;
      sunsetStart?: Date;
      dawn?: Date;
      dusk?: Date;
      solarNoon?: Date;
    };
  };
  export default SunCalc;
}



