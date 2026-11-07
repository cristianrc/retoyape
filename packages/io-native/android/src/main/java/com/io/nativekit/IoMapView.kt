package com.io.nativekit

import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Typeface
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.android.gms.maps.model.MapStyleOptions
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions

class IoMapView(private val reactContext: ThemedReactContext) :
    FrameLayout(reactContext), LifecycleEventListener {
    private val mapView = MapView(reactContext)
    private var googleMap: GoogleMap? = null
    private var markers = emptyList<MapMarker>()
    private val nativeMarkers = mutableMapOf<String, Marker>()
    private var selectedId = ""
    private var disposed = false
    private val brandFont =
        Typeface.createFromAsset(reactContext.assets, "fonts/PlusJakartaSans.ttf")

    init {
        addView(mapView, LayoutParams(-1, -1))
        val metadata =
            reactContext.packageManager
                .getApplicationInfo(reactContext.packageName, PackageManager.GET_META_DATA)
                .metaData
        val key = metadata?.getString("com.google.android.geo.API_KEY")
        if (key.isNullOrBlank()) {
            post {
                emit(
                    "topMapError",
                    Arguments.createMap().apply { putString("code", "MAPS_NOT_CONFIGURED") },
                )
            }
        } else {
            mapView.onCreate(null)
            mapView.onResume()
            reactContext.addLifecycleEventListener(this)
            mapView.getMapAsync { map ->
                if (disposed) return@getMapAsync
                googleMap = map
                map.setMapStyle(
                    MapStyleOptions.loadRawResourceStyle(reactContext, R.raw.io_yape_map)
                )
                map.uiSettings.isMapToolbarEnabled = false
                map.uiSettings.isZoomControlsEnabled = true
                map.setOnMarkerClickListener { marker ->
                    val markerId = marker.tag as? String ?: return@setOnMarkerClickListener true
                    emit(
                        "topMarkerPress",
                        Arguments.createMap().apply { putString("markerId", markerId) },
                    )
                    true
                }
                renderMarkers()
                emit("topMapReady", Arguments.createMap().apply { putBoolean("ready", true) })
            }
        }
    }

    fun setMarkers(value: List<MapMarker>) {
        val valid = MarkerPolicy.valid(value)
        if (valid == markers) return
        markers = valid
        renderMarkers()
    }

    fun setSelected(value: String) {
        if (selectedId == value) return
        selectedId = value
        highlight(true)
    }

    private fun renderMarkers() {
        val map = googleMap ?: return
        map.clear()
        nativeMarkers.clear()
        markers.forEach { item ->
            map.addMarker(
                    MarkerOptions()
                        .position(LatLng(item.latitude, item.longitude))
                        .title(item.title)
                        .icon(markerIcon(item.title, item.id == selectedId))
                        .anchor(0.5f, 1f)
                )
                ?.let {
                    it.tag = item.id
                    nativeMarkers[item.id] = it
                }
        }
        if (markers.isEmpty()) {
            map.moveCamera(CameraUpdateFactory.newLatLngZoom(LatLng(-12.12, -77.03), 12f))
        } else {
            post {
                if (!disposed && width > 0 && height > 0) {
                    if (markers.size == 1) {
                        map.moveCamera(
                            CameraUpdateFactory.newLatLngZoom(
                                LatLng(markers[0].latitude, markers[0].longitude),
                                14f,
                            )
                        )
                    } else {
                        val bounds = LatLngBounds.builder()
                        markers.forEach { bounds.include(LatLng(it.latitude, it.longitude)) }
                        map.moveCamera(
                            CameraUpdateFactory.newLatLngBounds(
                                bounds.build(),
                                width,
                                height,
                                minOf(dp(76), height / 3, width / 3),
                            )
                        )
                    }
                    highlight(false)
                }
            }
        }
        highlight(false)
    }

    private fun highlight(move: Boolean) {
        nativeMarkers.forEach { (id, marker) ->
            marker.setIcon(markerIcon(marker.title ?: "", id == selectedId))
            marker.zIndex = if (id == selectedId) 1f else 0f
            if (id == selectedId) {
                if (move) googleMap?.animateCamera(CameraUpdateFactory.newLatLng(marker.position))
            }
        }
    }

    fun resetCamera() {
        renderMarkers()
    }

    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()

    private fun markerIcon(
        title: String,
        selected: Boolean,
    ): com.google.android.gms.maps.model.BitmapDescriptor {
        val w = dp(160)
        val h = dp(78)
        val bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        canvas.scale(resources.displayMetrics.density, resources.displayMetrics.density)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        paint.typeface = Typeface.create(brandFont, Typeface.BOLD)
        paint.textSize = 10.5f
        val textWidth = paint.measureText(title).coerceAtMost(140f)
        paint.color = if (selected) Color.rgb(116, 34, 132) else Color.WHITE
        canvas.drawRoundRect(
            80f - textWidth / 2 - 10,
            0f,
            80f + textWidth / 2 + 10,
            27f,
            14f,
            14f,
            paint,
        )
        paint.color = if (selected) Color.WHITE else Color.rgb(79, 67, 79)
        canvas.drawText(title, 80f - paint.measureText(title) / 2, 17f, paint)
        paint.color = if (selected) Color.rgb(116, 34, 132) else Color.rgb(170, 88, 187)
        val pin =
            Path().apply {
                moveTo(80f, 78f)
                cubicTo(74f, 68f, 63f, 58f, 63f, 48f)
                cubicTo(63f, 25f, 97f, 25f, 97f, 48f)
                cubicTo(97f, 58f, 86f, 68f, 80f, 78f)
                close()
            }
        canvas.drawPath(pin, paint)
        paint.color = if (selected) Color.rgb(87, 251, 223) else Color.WHITE
        canvas.drawCircle(80f, 47f, 7f, paint)
        paint.color = if (selected) Color.rgb(116, 34, 132) else Color.rgb(170, 88, 187)
        paint.strokeWidth = 1.8f
        canvas.drawLine(76f, 47f, 79f, 50f, paint)
        canvas.drawLine(79f, 50f, 84f, 44f, paint)
        return BitmapDescriptorFactory.fromBitmap(bitmap)
    }

    private fun emit(name: String, data: WritableMap) {
        UIManagerHelper.getEventDispatcher(reactContext)
            ?.dispatchEvent(IoMapEvent(UIManagerHelper.getSurfaceId(this), id, name, data))
    }

    // Google Maps owns the child hierarchy; Fabric only lays out this wrapper.
    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        mapView.measure(
            MeasureSpec.makeMeasureSpec(right - left, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(bottom - top, MeasureSpec.EXACTLY),
        )
        mapView.layout(0, 0, right - left, bottom - top)
    }

    override fun requestLayout() {
        super.requestLayout()
        post {
            if (!disposed) {
                measure(
                    MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                    MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY),
                )
                layout(left, top, right, bottom)
            }
        }
    }

    override fun onHostResume() {
        if (!disposed) mapView.onResume()
    }

    override fun onHostPause() {
        if (!disposed) mapView.onPause()
    }

    override fun onHostDestroy() {
        dispose()
    }

    fun dispose() {
        if (disposed) return
        disposed = true
        reactContext.removeLifecycleEventListener(this)
        googleMap?.setOnMarkerClickListener(null)
        googleMap = null
        nativeMarkers.clear()
        mapView.onPause()
        mapView.onDestroy()
    }
}

private class IoMapEvent(
    surface: Int,
    viewId: Int,
    private val name: String,
    private val data: WritableMap,
) : Event<IoMapEvent>(surface, viewId) {
    override fun getEventName() = name

    override fun getEventData() = data

    override fun canCoalesce() = false
}
