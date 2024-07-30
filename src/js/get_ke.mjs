export default function get_ke(velocity_in_ms, weight_in_grains) {
    //returns the kinetic energy
    const weight_in_kg = weight_in_grains / 15.432 / 1000
    return (Math.round(0.5 * weight_in_kg * Math.pow(velocity_in_ms,2) * 100) / 100).toFixed(2);
}