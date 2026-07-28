/**
 * Represents the weather conditions during a training or competition session.
 *
 * The weather values are using the metric system (eg. temperature in degrees Celsius °C).
 */
type Weather = {
  /**
   * Temperature in degrees Celsius (°C)
   */
  temperature?: number;

  trackCondition?: 'damp' | 'dry' | 'wet';

  conditions?: 'cloudy' | 'foggy' | 'rainy' | 'snowy' | 'sunny';

  /**
   * Wind speed in kilometers per hour (km/h)
   */
  windSpeed?: number;

  /**
   * Air pressure in hectopascal (hPa)
   */
  airPressure?: number;

  /**
   * Humidity percentage (0-100%)
   */
  humidity?: number;
};
