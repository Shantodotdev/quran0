# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# ui-design
- Prefer simple plus/minus stepper controls for font size settings instead of preset labels (Small/Medium/Large). Confidence: 0.65
- Use the existing custom `ThemeSelector` dropdown component for theme selection instead of native `<select>` elements or grid-of-buttons. Confidence: 0.70

# ui-design
- Prefer simple plus/minus stepper controls for font size settings instead of preset labels (Small/Medium/Large). Confidence: 0.65
- Use the existing custom `ThemeSelector` dropdown component for theme selection instead of native `<select>` elements or grid-of-buttons. Confidence: 0.70
- Dropdown/selector components should use absolute positioning so they overlay content instead of taking up relative space and shifting other elements. Confidence: 0.70

# code-style
- When a component is only used in one context, avoid adding variant/props extensibility for other contexts that no longer apply. Confidence: 0.70

# hydration
- Persisted UI state (e.g., bookmark filled state) must be synced before first paint via an inline `<script>` in `<head>`, following the same pattern as theme and settings stores, to prevent hydration flash. Confidence: 0.75
