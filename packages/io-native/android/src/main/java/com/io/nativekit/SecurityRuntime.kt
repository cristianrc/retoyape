package com.io.nativekit

import java.security.SecureRandom
import java.util.concurrent.atomic.AtomicBoolean

internal data class SecurityEvent(
    val type: String,
    val cardId: String,
    val code: String = "",
    val reason: String = "",
)

internal object SecurityRuntime {
    val tokens =
        TokenService(ByteArray(32).also { SecureRandom().nextBytes(it) }, System::currentTimeMillis)
    val opening = AtomicBoolean(false)
    var emit: ((SecurityEvent) -> Unit)? = null
    val cardIds = setOf("card_001", "card_002")
}
