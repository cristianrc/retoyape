package com.io.nativekit

import org.junit.Assert.*
import org.junit.Test

class NativePoliciesTest {
    private var time = 1000L
    private val tokens = TokenService(ByteArray(32) { 7 }, { time })

    @Test
    fun validTokenAndRenewal() {
        val first = tokens.issue("card_001")
        assertNull(tokens.validate("card_001", first))
        assertNotEquals(first, tokens.issue("card_001"))
        time += 60_000
        assertEquals("TOKEN_EXPIRED", tokens.validate("card_001", first))
        assertNull(tokens.validate("card_001", tokens.issue("card_001")))
    }

    @Test
    fun invalidTokenCases() {
        val valid = tokens.issue("card_001")
        for (value in
            listOf("", "invalid", "x".repeat(513), valid + "0", valid.replace("61000", "62000"))) {
            assertEquals("TOKEN_INVALID", tokens.validate("card_001", value))
        }
        assertEquals("TOKEN_INVALID", tokens.validate("card_002", valid))
        val otherIssuer = TokenService(ByteArray(32) { 8 }, { time })
        assertEquals("TOKEN_INVALID", otherIssuer.validate("card_001", valid))
    }

    @Test
    fun rejectsMalformedExpiryAndVersion() {
        assertEquals("TOKEN_INVALID", tokens.validate("card_001", "v1:card_001:bad:nonce:sig"))
        assertEquals("TOKEN_INVALID", tokens.validate("card_001", "v2:card_001:61000:nonce:sig"))
    }

    @Test
    fun timeoutIncludesBackgroundAndEmitsOnce() {
        val reasons = mutableListOf<String>()
        val session = SecureSession({ time }, reasons::add)
        assertEquals(45_000L, session.remainingMillis())
        time += 44_999
        assertFalse(session.checkTimeout())
        time += 1
        assertTrue(session.checkTimeout())
        session.close("USER_DISMISS")
        session.checkTimeout()
        assertEquals(listOf("TIMEOUT"), reasons)
    }

    @Test
    fun manualDismissEmitsOnce() {
        val reasons = mutableListOf<String>()
        val session = SecureSession({ time }, reasons::add)
        session.close("USER_DISMISS")
        time += 90_000
        session.checkTimeout()
        assertEquals(listOf("USER_DISMISS"), reasons)
    }

    @Test
    fun markerBoundaryCases() {
        val valid = MapMarker("1", "Valid", -12.1, -77.0)
        assertEquals(emptyList<MapMarker>(), MarkerPolicy.valid(emptyList()))
        assertEquals(
            listOf(valid),
            MarkerPolicy.valid(
                listOf(
                    valid,
                    valid,
                    valid.copy(id = "2", latitude = 91.0),
                    valid.copy(id = "3", longitude = Double.NaN),
                    valid.copy(id = "4", longitude = -181.0),
                    valid.copy(id = ""),
                )
            ),
        )
        assertEquals(valid, MarkerPolicy.selected(listOf(valid), "1"))
        assertNull(MarkerPolicy.selected(listOf(valid), "missing"))
    }
}
