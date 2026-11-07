package com.io.nativekit

data class MapMarker(
    val id: String,
    val title: String,
    val latitude: Double,
    val longitude: Double,
)

object MarkerPolicy {
    fun valid(markers: List<MapMarker>): List<MapMarker> =
        markers
            .filter {
                it.id.isNotBlank() &&
                    it.latitude.isFinite() &&
                    it.longitude.isFinite() &&
                    it.latitude in -90.0..90.0 &&
                    it.longitude in -180.0..180.0
            }
            .distinctBy { it.id }

    fun selected(markers: List<MapMarker>, id: String): MapMarker? =
        markers.firstOrNull { it.id == id }
}
