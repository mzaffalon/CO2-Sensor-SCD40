// Hier kann man Tests durchführen; diese Datei wird nicht kompiliert, wenn dieses Paket als Erweiterung verwendet wird.
basic.forever(function () {
    serial.writeValue("CO2", SCD40.get_co2());
    serial.writeValue("T", SCD40.get_temperature(SCD40.SCD40_T_UNIT.C));
    serial.writeValue("RH", SCD40.get_relative_humidity());
    basic.pause(5000);
})