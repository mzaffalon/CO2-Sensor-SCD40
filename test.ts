// tests go here; this will not be compiled when this package is used as an extension.
basic.forever(function () {
    serial.writeValue("CO2", SCD40.get_co2());
    serial.writeValue("T", SCD40.get_temperature(SCD40.SCD40_T_UNIT.C));
    serial.writeValue("RH", SCD40.get_relative_humidity());
    basic.pause(5000);
})