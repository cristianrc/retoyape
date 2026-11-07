package com.io.nativekit

import android.content.Intent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = IoSecurityModule.NAME)
class IoSecurityModule(context: ReactApplicationContext) : NativeIoSecuritySpec(context) {
    private val emitter: (SecurityEvent) -> Unit = { event ->
        emitOnSecureEvent(
            Arguments.createMap().apply {
                putString("type", event.type)
                putString("cardId", event.cardId)
                putString("code", event.code)
                putString("reason", event.reason)
            }
        )
    }

    init {
        SecurityRuntime.emit = emitter
    }

    override fun getName() = NAME

    override fun requestMockSecureToken(cardId: String, promise: Promise) {
        if (cardId !in SecurityRuntime.cardIds) {
            promise.reject("CARD_NOT_FOUND", "Tarjeta no disponible")
            return
        }
        promise.resolve(SecurityRuntime.tokens.issue(cardId))
    }

    override fun openSecureView(cardId: String, secureToken: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            val error =
                SecurityRuntime.tokens.validate(cardId, secureToken)
                    ?: if (cardId !in SecurityRuntime.cardIds) "TOKEN_INVALID" else null
            if (error != null) {
                emitter(SecurityEvent("onValidationError", cardId, code = error))
                promise.reject(error, "No se pudo validar la sesión segura")
                return@runOnUiThread
            }
            val activity = reactApplicationContext.currentActivity
            if (activity == null || activity.isFinishing) {
                promise.reject("ACTIVITY_UNAVAILABLE", "La aplicación no está disponible")
                return@runOnUiThread
            }
            if (!SecurityRuntime.opening.compareAndSet(false, true)) {
                promise.reject("SESSION_ACTIVE", "Ya existe una sesión segura")
                return@runOnUiThread
            }
            try {
                activity.startActivity(
                    Intent(activity, SecureCardActivity::class.java).apply {
                        putExtra("cardId", cardId)
                        putExtra("secureToken", secureToken)
                    }
                )
                promise.resolve(null)
            } catch (_: Exception) {
                SecurityRuntime.opening.set(false)
                promise.reject("OPEN_FAILED", "No se pudo abrir la vista segura")
            }
        }
    }

    override fun requestDemoToken(cardId: String, scenario: String, promise: Promise) {
        if (!BuildConfig.DEBUG || cardId !in SecurityRuntime.cardIds) {
            promise.reject("DEMO_UNAVAILABLE", "Escenario no disponible")
            return
        }
        when (scenario) {
            "expired" -> promise.resolve(SecurityRuntime.tokens.issue(cardId, -1))
            "invalid" -> promise.resolve(SecurityRuntime.tokens.issue(cardId) + "invalid")
            else -> promise.reject("DEMO_UNAVAILABLE", "Escenario no disponible")
        }
    }

    override fun invalidate() {
        if (SecurityRuntime.emit === emitter) SecurityRuntime.emit = null
        super.invalidate()
    }

    companion object {
        const val NAME = "IoSecurity"
    }
}
