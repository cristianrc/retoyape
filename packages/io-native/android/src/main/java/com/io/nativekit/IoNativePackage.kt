package com.io.nativekit

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class IoNativePackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        if (name == IoSecurityModule.NAME) IoSecurityModule(reactContext) else null

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            IoSecurityModule.NAME to
                ReactModuleInfo(
                    IoSecurityModule.NAME,
                    IoSecurityModule::class.java.name,
                    false,
                    false,
                    false,
                    true,
                )
        )
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> = listOf(IoMapManager())
}
