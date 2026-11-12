# Changelog

## v1.3.1
Fixes for Spotify 1.3.9 and Spicetify 2.46.7, which renamed some internal classes.

### Fixed
- Play buttons showed as permanent accent squares on the Home shortcuts. They are round again and only appear on hover.
- Artist and profile photos were square in search results. They are round again.
- Cards lost their hover background.
- Entity titles lost their halo over hero photos on the Light scheme.

### Changed
- Artist and profile cards are now found by their `spotify:artist:` / `spotify:user:` id, which does not change between Spotify updates.
- Card and title rules accept both the old and the new class names, so the theme works with older Spicetify versions too.

## v1.3
### New
- Accent colours: Pink, Orange, Blue, Purple and Green, for both Dark and Light. Red stays the default.

### Fixed
- The "Added to queue" toast went under the player.
- White line on the search bar when focused.
- Home and Marketplace buttons turned white on hover.
- The "..." menu dots on Windows were off-centre in their pill.

## v1.2
### New
- Clearer liquid glass: lighter tint and blur, lit rim and soft sheen.
- Listening activity: the friend who is playing now stands out.

### Fixed
- Context-menu sub-menus were cut off.
- Fullscreen lyrics stayed stuck at the top.
- Square corners on the title bar and the library.
- Dark gap under the filter chips on Home.
- 1px line under the top bar.
- Page scrollbar thumb always visible and at least 64px tall.

## v1.1
### New
- Complete Light scheme, lyrics and fullscreen views included.
- Glass search suggestions and results filter bar.
- Brighter lyrics background.

### Fixed
- Canvas videos fade into the page.
- Flat colour background in the fullscreen view.
- Unreadable text in the Light scheme.
