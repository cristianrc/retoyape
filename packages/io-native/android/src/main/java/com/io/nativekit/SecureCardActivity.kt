package com.io.nativekit

import android.app.Activity
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.Gravity
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.ScrollView
import android.widget.TextView

class SecureCardActivity : Activity() {
    private val handler = Handler(Looper.getMainLooper())
    private lateinit var cover: TextView
    private lateinit var countdown: TextView
    private lateinit var progress: ProgressBar
    private var session: SecureSession? = null
    private var cardId = ""
    private val tick =
        object : Runnable {
            override fun run() {
                val active = session ?: return
                if (active.checkTimeout()) {
                    finish()
                    return
                }
                countdown.text =
                    "Esta vista se ocultará en ${(active.remainingMillis() + 999) / 1000} s"
                progress.progress = active.remainingMillis().toInt()
                handler.postDelayed(this, 250)
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= 33) {
            onBackInvokedDispatcher.registerOnBackInvokedCallback(0) { dismiss() }
        }
        cardId = intent.getStringExtra("cardId") ?: ""
        val token = intent.getStringExtra("secureToken") ?: ""
        intent.removeExtra("secureToken")
        val error =
            SecurityRuntime.tokens.validate(cardId, token)
                ?: if (cardId !in SecurityRuntime.cardIds) "TOKEN_INVALID" else null
        if (error != null || savedInstanceState != null) {
            SecurityRuntime.emit?.invoke(
                SecurityEvent("onValidationError", cardId, code = error ?: "TOKEN_INVALID")
            )
            finish()
            return
        }
        SecurityRuntime.emit?.invoke(SecurityEvent("onSecureViewOpened", cardId))
        session =
            SecureSession(SystemClock::elapsedRealtime) { reason ->
                SecurityRuntime.emit?.invoke(
                    SecurityEvent("onSecureViewClosed", cardId, reason = reason)
                )
            }
        buildContent()
        window.decorView.post {
            if (!isFinishing) SecurityRuntime.emit?.invoke(SecurityEvent("onCardDataShown", cardId))
        }
        handler.post(tick)
    }

    @Suppress("DEPRECATION")
    private fun buildContent() {
        val purple = Color.rgb(116, 34, 132)
        val deep = Color.rgb(89, 0, 106)
        val ink = Color.rgb(26, 28, 30)
        val muted = Color.rgb(129, 115, 128)
        val canvasColor = Color.rgb(250, 249, 252)
        val pale = Color.rgb(252, 235, 255)
        val baseFont = Typeface.createFromAsset(assets, "fonts/PlusJakartaSans.ttf")
        fun font(weight: Int): Typeface =
            if (Build.VERSION.SDK_INT >= 28) {
                Typeface.create(baseFont, weight, false)
            } else Typeface.create(baseFont, if (weight >= 600) Typeface.BOLD else Typeface.NORMAL)
        fun rounded(color: Int, radius: Int = 16) =
            GradientDrawable().apply {
                setColor(color)
                cornerRadius = dp(radius).toFloat()
            }
        fun text(value: String, size: Float = 14f, weight: Int = 400, color: Int = ink) =
            TextView(this).apply {
                this.text = value
                textSize = size
                typeface = font(weight)
                setTextColor(color)
                includeFontPadding = false
                setTextIsSelectable(false)
            }
        fun icon(resource: Int, color: Int, size: Int = 24) =
            ImageView(this).apply {
                setImageResource(resource)
                setColorFilter(color)
                layoutParams = LinearLayout.LayoutParams(dp(size), dp(size))
                importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
            }
        fun column(padding: Int = 0) =
            LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(dp(padding), dp(padding), dp(padding), dp(padding))
            }
        fun row() =
            LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
            }
        fun space(parent: LinearLayout, height: Int) {
            parent.addView(View(this), LinearLayout.LayoutParams(1, dp(height)))
        }
        val root = FrameLayout(this).apply { setBackgroundColor(canvasColor) }
        val layout = column()
        val bar =
            row().apply {
                setBackgroundColor(purple)
                setPadding(dp(20), 0, dp(20), 0)
            }
        val back =
            FrameLayout(this).apply {
                contentDescription = "Volver"
                isClickable = true
                isFocusable = true
                addView(
                    icon(R.drawable.io_icon_back, Color.WHITE),
                    FrameLayout.LayoutParams(dp(24), dp(24), Gravity.CENTER),
                )
                setOnClickListener { dismiss() }
            }
        bar.addView(back, LinearLayout.LayoutParams(dp(48), dp(48)))
        bar.addView(
            text("Reto Yape", 22f, 800, Color.WHITE).apply { letterSpacing = -0.02f },
            LinearLayout.LayoutParams(0, -2, 1f),
        )
        val profile =
            row().apply {
                background = rounded(Color.rgb(139, 66, 152), 99)
                setPadding(dp(6), dp(6), dp(12), dp(6))
            }
        profile.addView(
            FrameLayout(this).apply {
                background = rounded(deep, 99)
                addView(
                    icon(R.drawable.io_icon_user, Color.WHITE, 18),
                    FrameLayout.LayoutParams(dp(18), dp(18), Gravity.CENTER),
                )
            },
            LinearLayout.LayoutParams(dp(32), dp(32)),
        )
        profile.addView(
            text("TÚ", 13f, 700, Color.WHITE),
            LinearLayout.LayoutParams(-2, -2).apply { leftMargin = dp(7) },
        )
        bar.addView(profile, LinearLayout.LayoutParams(-2, -2).apply { leftMargin = dp(18) })
        layout.addView(bar, LinearLayout.LayoutParams(-1, dp(64)))

        val content = column().apply { setPadding(dp(20), dp(24), dp(20), dp(28)) }
        content.addView(
            text("Tus datos, protegidos", 32f, 800).apply {
                letterSpacing = -0.02f
                setLineSpacing(dp(2).toFloat(), 1f)
                accessibilityHeadingCompat()
            }
        )
        space(content, 14)
        val badge =
            row().apply {
                background = rounded(pale, 99)
                setPadding(dp(12), dp(7), dp(14), dp(7))
            }
        badge.addView(icon(R.drawable.io_icon_shield, deep, 17))
        badge.addView(
            text("YAPE / VISTA SEGURA", 11f, 700, deep),
            LinearLayout.LayoutParams(-2, -2).apply { leftMargin = dp(7) },
        )
        content.addView(badge, LinearLayout.LayoutParams(-2, -2))
        space(content, 22)

        val card = column(20).apply { background = rounded(Color.WHITE, 32) }
        val heading = row()
        heading.addView(
            FrameLayout(this).apply {
                background = rounded(pale, 99)
                addView(
                    icon(R.drawable.io_icon_card, deep),
                    FrameLayout.LayoutParams(dp(23), dp(23), Gravity.CENTER),
                )
            },
            LinearLayout.LayoutParams(dp(38), dp(38)),
        )
        heading.addView(
            text(
                if (cardId == "card_001") "VISA · Crédito Yape" else "Mastercard · Débito Yape",
                15f,
                700,
            ),
            LinearLayout.LayoutParams(0, -2, 1f).apply { leftMargin = dp(12) },
        )
        card.addView(heading)
        space(card, 22)

        fun field(label: String, value: String, size: Float): LinearLayout {
            val field = column(14).apply { background = rounded(Color.rgb(244, 243, 246), 12) }
            field.addView(text(label, 10f, 700, muted))
            space(field, 9)
            field.addView(text(value, size, 700))
            return field
        }
        card.addView(
            field(
                "NÚMERO DE TARJETA",
                if (cardId == "card_001") "4111 1111 1111 1234" else "5555 5555 5555 5678",
                21f,
            )
        )
        space(card, 14)
        card.addView(field("TITULAR", "USUARIO DEMOSTRACIÓN", 15f))
        space(card, 14)
        val details = row().apply { gravity = Gravity.TOP }
        details.addView(
            field("VENCIMIENTO", if (cardId == "card_001") "12/28" else "06/29", 19f),
            LinearLayout.LayoutParams(0, -2, 1f),
        )
        val cvv = field("CVV", if (cardId == "card_001") "123" else "456", 19f)
        details.addView(cvv, LinearLayout.LayoutParams(0, -2, 1f).apply { leftMargin = dp(12) })
        card.addView(details)
        space(card, 18)
        val sessionBox = column(14).apply { background = rounded(Color.rgb(254, 245, 255), 16) }
        val sessionRow = row().apply { gravity = Gravity.TOP }
        sessionRow.addView(icon(R.drawable.io_icon_clock, deep, 19))
        countdown = text("", 13f, 700, deep)
        sessionRow.addView(
            countdown,
            LinearLayout.LayoutParams(0, -2, 1f).apply { leftMargin = dp(8) },
        )
        sessionBox.addView(sessionRow)
        space(sessionBox, 12)
        progress =
            ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
                max = 45_000
                progress = 45_000
                progressTintList = ColorStateList.valueOf(deep)
                progressBackgroundTintList = ColorStateList.valueOf(Color.rgb(230, 228, 232))
                importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
            }
        sessionBox.addView(progress, LinearLayout.LayoutParams(-1, dp(7)))
        card.addView(sessionBox)
        space(card, 20)
        val hide =
            row().apply {
                gravity = Gravity.CENTER
                background = rounded(deep, 99)
                setPadding(dp(16), dp(16), dp(16), dp(16))
                minimumHeight = dp(56)
                isClickable = true
                isFocusable = true
                contentDescription = "Ocultar datos"
                setOnClickListener { dismiss() }
            }
        hide.addView(icon(R.drawable.io_icon_eye_off, Color.WHITE, 23))
        hide.addView(
            text("Ocultar datos", 17f, 800, Color.WHITE),
            LinearLayout.LayoutParams(-2, -2).apply { leftMargin = dp(9) },
        )
        card.addView(hide, LinearLayout.LayoutParams(-1, -2))
        content.addView(card)
        space(content, 18)
        content.addView(
            text("Datos ficticios · No se guardan en el dispositivo", 10f, 400, muted).apply {
                gravity = Gravity.CENTER
            }
        )
        layout.addView(
            ScrollView(this).apply {
                isFillViewport = true
                addView(content)
            },
            LinearLayout.LayoutParams(-1, 0, 1f),
        )
        root.addView(layout, FrameLayout.LayoutParams(-1, -1))
        cover =
            text("Sesión protegida", 22f, 700, Color.WHITE).apply {
                gravity = Gravity.CENTER
                setBackgroundColor(deep)
                importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_YES
                visibility = View.GONE
            }
        root.addView(cover, FrameLayout.LayoutParams(-1, -1))
        setContentView(root)
        if (Build.VERSION.SDK_INT >= 30) {
            window.insetsController?.setSystemBarsAppearance(
                0,
                WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
            )
        } else window.decorView.systemUiVisibility = 0
        root.setOnApplyWindowInsetsListener { view, insets ->
            val left: Int
            val top: Int
            val right: Int
            val bottom: Int
            if (Build.VERSION.SDK_INT >= 30) {
                val bars = insets.getInsets(WindowInsets.Type.systemBars())
                left = bars.left
                top = bars.top
                right = bars.right
                bottom = bars.bottom
            } else {
                left = insets.systemWindowInsetLeft
                top = insets.systemWindowInsetTop
                right = insets.systemWindowInsetRight
                bottom = insets.systemWindowInsetBottom
            }
            view.setPadding(left, 0, right, bottom)
            bar.setPadding(dp(20), top, dp(20), 0)
            bar.layoutParams = LinearLayout.LayoutParams(-1, dp(64) + top)
            insets
        }
        root.requestApplyInsets()
    }

    private fun TextView.accessibilityHeadingCompat() {
        if (Build.VERSION.SDK_INT >= 28) isAccessibilityHeading = true
    }

    override fun onPause() {
        if (::cover.isInitialized) cover.visibility = View.VISIBLE
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        if (session?.checkTimeout() == true) {
            finish()
            return
        }
        if (::cover.isInitialized) cover.visibility = View.GONE
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        dismiss()
    }

    private fun dismiss() {
        session?.close("USER_DISMISS")
        finish()
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        session?.close("USER_DISMISS")
        SecurityRuntime.opening.set(false)
        super.onDestroy()
    }

    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
}
