package com.io.nativekit

import java.security.MessageDigest
import java.util.UUID
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

class TokenService(private val secret: ByteArray, private val now: () -> Long) {
    fun issue(cardId: String, ttlMillis: Long = 60_000): String {
        require(cardId.matches(Regex("card_[0-9]{3}")))
        val payload = "v1:$cardId:${now() + ttlMillis}:${UUID.randomUUID()}"
        return "$payload:${sign(payload)}"
    }

    fun validate(cardId: String, token: String): String? {
        if (token.length > 512) return "TOKEN_INVALID"
        val parts = token.split(':')
        if (parts.size != 5 || parts[0] != "v1" || parts[1] != cardId) return "TOKEN_INVALID"
        val expiry = parts[2].toLongOrNull() ?: return "TOKEN_INVALID"
        val expected = sign(parts.take(4).joinToString(":"))
        if (!MessageDigest.isEqual(expected.toByteArray(), parts[4].toByteArray()))
            return "TOKEN_INVALID"
        return if (expiry <= now()) "TOKEN_EXPIRED" else null
    }

    private fun sign(payload: String): String {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(secret, "HmacSHA256"))
        return mac.doFinal(payload.toByteArray(Charsets.UTF_8)).joinToString("") {
            "%02x".format(it)
        }
    }
}
