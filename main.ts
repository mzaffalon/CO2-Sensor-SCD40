//% weight=80 color=#00A654 icon="\uf0c2" block="CO2-Sensor SCD40"
namespace SCD40 {

    export enum SCD40_T_UNIT {
        //% block="°C"
        C = 0,
        //% block="°F"
        F = 1
    }

    const SCD40_I2C_ADDR = 0x62;

    let co2 = 0;
    let temperature = 0;
    let temperatureF = 0;
    let relative_humidity = 0;
    let CTH = [0, 0, 0];

    init();

    function read_word(repeat = false) {
        let value = pins.i2cReadNumber(SCD40_I2C_ADDR, NumberFormat.UInt16BE, repeat);
        pins.i2cReadNumber(SCD40_I2C_ADDR, NumberFormat.UInt8BE, repeat);
        return value;
    }

    function read_words(number_of_words: number) {
        let buffer = pins.i2cReadBuffer(SCD40_I2C_ADDR, number_of_words * 3, false);
        let words: number[] = [];
        for (let i = 0; i < number_of_words; i++) {
            words.push(buffer.getNumber(NumberFormat.UInt16BE, 3 * i));
        }
        return words;
    }

    function get_data_ready_status() {
        pins.i2cWriteNumber(SCD40_I2C_ADDR, 0xE4B8, NumberFormat.UInt16BE);
        basic.pause(1);
        let data_ready = read_word() & 0x07FF;
        return data_ready > 0;
    }

    function read_measurement() {
        // only read measurement if data is available, else use last measurement
        if (!get_data_ready_status()) {
            return
        }
        pins.i2cWriteNumber(SCD40_I2C_ADDR, 0xEC05, NumberFormat.UInt16BE);
        basic.pause(1);
        let values = read_words(6);
        co2 = values[0];
        let adc_t = values[1];
        let adc_rh = values[2];
        temperature = -45 + (175 * adc_t / (1 << 16));
        temperature = (Math.round(temperature * 10) / 10)
        temperatureF = 32 + ((temperature * 9) / 5);
        relative_humidity = 100 * adc_rh / (1 << 16);
        relative_humidity = (Math.round(relative_humidity * 10) / 10)
    }

    /**
     * perform a factory reset
     */
    //% blockId="SCD40_PERFORM_FACTORY_RESET" block="factory reset"
    //% block.loc.de="auf Werkseinstellung setzen"    
    //% weight=60 blockGap=8 advanced=true
    export function perform_factory_reset() {
        pins.i2cWriteNumber(SCD40_I2C_ADDR, 0x3632, NumberFormat.UInt16BE);
    }

    export function init() {
        start_continuous_measurement();
    }

    /**
     * start continuous measurement. Call this before reading measurements
     */
    //% blockId="SCD40_START_CONTINUOUS_MEASUREMENT" block="start continuous measurement"
    //% block.loc.de="starte dauerhafte Messung"
    //% weight=70 blockGap=8 advanced=true
    export function start_continuous_measurement() {
        pins.i2cWriteNumber(SCD40_I2C_ADDR, 0x21b1, NumberFormat.UInt16BE);
    }

    /**
     * stop continuous measurement. Call this to stop SCD40 internal measurements
     */
    //% blockId="SCD40_STOP_CONTINUOUS_MEASUREMENT" block="stop continuous measurement"
    //% block.loc.de="stoppe dauerhafte Messung"
    //% weight=70 blockGap=8 advanced=true
    export function stop_continuous_measurement() {
        pins.i2cWriteNumber(SCD40_I2C_ADDR, 0x3F86, NumberFormat.UInt16BE);
        basic.pause(500);
    }

    /**
     * get CO2. Call this at most once every 5 seconds, else last measurement value will be returned
     */
    //% blockId="SCD40_GET_CO2" block="CO2 (ppm)"
    //% block.loc.de="CO2 (ppm)"
    //% weight=80 blockGap=8
    export function get_co2() {
        read_measurement();
        return co2;
    }

    /**
     * get temperature. Call this at most once every 5 seconds, else last measurement value will be returned
     */
    //% blockId="SCD40_GET_TEMPERATURE" block="temperature $units [°C or°F]"
    //% block.loc.de="Temperatur $units [°C or °F]"
    //% weight=80 blockGap=8
    export function get_temperature(unit: SCD40_T_UNIT = SCD40_T_UNIT.C) {
        read_measurement();
        return (unit == SCD40_T_UNIT.C) ? temperature : temperatureF;
    }

    /**
     * get relative humidity. Call this at most once every 5 seconds, else last measurement value will be returned
     */
    //% blockId="SCD40_GET_RELATIVE_HUMIDITY" block="relative humidity"
    //% block.loc.de="relative Luftfeuchtigkeit"
    //% weight=80 blockGap=8
    export function get_relative_humidity() {
        read_measurement();
        return relative_humidity;
    }

    /**
     * get CO2, temperature and relative humidity at once. Call this at most once every 5 seconds, else last measurement value will be returned
    */
    //% blockId="SCD40_GET_ALL_READINGS"
    //% block="all reading"
    //% block.loc.de="CO2, Temperatur und Luftfeuchtigkeit|input °C or °F"
    //% weight=80 blockGap=8
    export function get_all_readings(unit: SCD40_T_UNIT = SCD40_T_UNIT.C) : number[] {
        read_measurement();
        let _temperature = (unit == SCD40_T_UNIT.C ? temperature : temperatureF);
        return [co2, _temperature, relative_humidity];
    }
}
