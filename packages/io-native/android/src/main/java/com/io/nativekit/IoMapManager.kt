package com.io.nativekit

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.IoMapManagerDelegate
import com.facebook.react.viewmanagers.IoMapManagerInterface

class IoMapManager : SimpleViewManager<IoMapView>(), IoMapManagerInterface<IoMapView> {
    private val managerDelegate = IoMapManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<IoMapView> = managerDelegate

    override fun getName() = "IoMap"

    override fun createViewInstance(context: ThemedReactContext) = IoMapView(context)

    @ReactProp(name = "markers")
    override fun setMarkers(view: IoMapView, value: ReadableArray?) {
        val markers = mutableListOf<MapMarker>()
        if (value != null)
            for (i in 0 until value.size()) {
                try {
                    val item = value.getMap(i) ?: continue
                    markers.add(
                        MapMarker(
                            item.getString("id") ?: "",
                            item.getString("title") ?: "",
                            item.getDouble("latitude"),
                            item.getDouble("longitude"),
                        )
                    )
                } catch (_: RuntimeException) {
                    continue
                }
            }
        view.setMarkers(markers)
    }

    @ReactProp(name = "selectedMarkerId")
    override fun setSelectedMarkerId(view: IoMapView, value: String?) {
        view.setSelected(value ?: "")
    }

    @ReactProp(name = "cameraResetKey", defaultInt = 0)
    override fun setCameraResetKey(view: IoMapView, value: Int) {
        if (value > 0) view.resetCamera()
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> =
        mapOf(
            "topMarkerPress" to mapOf("registrationName" to "onMarkerPress"),
            "topMapReady" to mapOf("registrationName" to "onMapReady"),
            "topMapError" to mapOf("registrationName" to "onMapError"),
        )

    override fun onDropViewInstance(view: IoMapView) {
        view.dispose()
        super.onDropViewInstance(view)
    }
}
