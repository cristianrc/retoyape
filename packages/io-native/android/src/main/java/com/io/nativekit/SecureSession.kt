package com.io.nativekit

class SecureSession(private val now: () -> Long, private val emitClosed: (String) -> Unit) {
    private val deadline = now() + 45_000
    var closed = false
        private set

    fun remainingMillis(): Long = (deadline - now()).coerceAtLeast(0)

    fun checkTimeout(): Boolean {
        if (remainingMillis() == 0L) close("TIMEOUT")
        return closed
    }

    fun close(reason: String) {
        if (closed) return
        closed = true
        emitClosed(reason)
    }
}
