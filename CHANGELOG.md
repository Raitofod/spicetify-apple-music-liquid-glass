# Changelog

## v1.4.8
### Changed
- Listening activity: the icon next to a friend who is playing something right now is animated, like the "now playing" bars next to your own track, in the accent colour.

### Fixed
- Light scheme: hovering a cover in the library, or a friend's photo in Listening activity, showed a black play glyph on the dark veil, nearly invisible. It is white now, in both schemes.
- The play button of search's top result sat in an accent square: Spotify 1.3.10 moved the play button's marker to a square cell around it. Only the round button is painted now.

## v1.4.7
### Fixed
- Hovering the Marketplace icon in the top bar cut its round button into a square: Spicetify keeps custom links in a scroller exactly as big as the button, which clipped it when it grew. The button now has room around it, keeps its full circle on hover and gets back the soft shadow of the other controls. Nothing moves, and the page under the bar still takes its clicks.
- The animated "now playing" bars next to the playing track stayed Spotify green whatever the accent (#4). They take the accent colour now, animated or still. The white bars over cover art stay white.

## v1.4.6
### New
- Each scheme remembers its own accent: pick Green in Dark and Blue in Light, and the sun / moon button brings back the right one every time, after a restart too. A scheme you never picked an accent for follows the current one, as before. Choices saved by earlier versions load as they were.

### Fixed
- Every floating container was reviewed, in Dark and Light, for glass that was only half there:
  - Dialogs (Marketplace settings, extensions' pop-ups): once the Marketplace had been opened, its stylesheet put an opaque frame around the glass sheet. The frame is clear now.
  - "Sort by / View as" menus (library, playlists): two separate glass boxes and an opaque grey view switch. One pane now, with a hairline between its two sections.
  - Tooltips and toasts were opaque. They wear the glass now, on Windows and macOS.
  - The Marketplace's sort box was an opaque field over an opaque list. Both are glass now, like every other menu.
  - The search field of the "Add to playlist" sub-menu is a pill, like the one in the sheet.

## v1.4.5
### Fixed
- While search suggestions were loading, their panel was an opaque grey box: Spotify shows the loading state in a different container. It now wears the same glass as the loaded suggestions.
- The "Add to playlist" sheet (the + next to the playing title) was a glass list inside an opaque frame. The whole sheet is one glass pane now, and its search field is a pill like the one in the top bar.
- Checked on Spotify 1.3.10 (Windows and macOS).

## v1.4.4
### New
- Accent switch: a coloured dot sits first in the bell / friends capsule, the mirror of the Light/Dark button. Clicking it opens a glass pill with the six accents (Red, Pink, Orange, Blue, Purple, Green); the whole app follows, in Dark and in Light, and the choice is remembered. Works with the mouse and the keyboard (arrows, Escape).

### Fixed
- Hovering the play/pause button hid it in the Light scheme: Spotify painted its own near-white disc under the white glyph. The disc keeps its colour on hover now.

### Changed
- The theme is now licensed under the GNU General Public License v3.0 (previously MIT).
- New README: banner, before/after and accent animations, install guide and FAQ.

## v1.4.3
### Fixed
- Right-click and "..." menus were almost opaque next to the rest of the theme (14px blur, dense tint). They now use the same sharp glass as the search suggestions and the top bar controls, so the page shows through them. Dialogs keep their denser glass.

## v1.4.2
### Fixed
- The right panel had rounded corners against the window edge (added by Spicy Lyrics), which showed white notches in the Light scheme. It is square again.
- Search suggestions use the same sharp glass as the rest of the theme (4px blur instead of 14px), like the search field above them.
- The last rows of a page, the library and the right panel were hidden under the player and could not be clicked. Every page now scrolls far enough to clear it, and the three columns stop at the same height above the player.
- The library and the right panel could not be resized: with no gap between panels, their grips were 0px wide. They are grabbable again.
- Home's large video cards ("Made for you", playlist promos) had dark titles over their dark video in the Light scheme. They are light again.
- With Spicy Lyrics, the right panel's secondary text (credits, tour dates, "Show all") was dark on its dark background in the Light scheme. It is light again.

## v1.4.1
### Fixed
- macOS: the Light/Dark button did not show up. Spicetify's top bar API looks for class names the macOS build doesn't have, so the theme now places the button itself, next to the back and forward arrows (#3).
- Switching scheme in the Marketplace kept the colours forced by the button until a restart. The new scheme now applies right away.
- Icons in the top bar capsules are spaced evenly: the sun no longer sits against the rim.

## v1.4
### New
- Light/Dark switch: a button in the top bar flips the current scheme to its twin (`Dark-Orange` becomes `Light-Orange`) and keeps your accent. The choice is remembered across restarts.

### Changed
- Cleaner top bar: no more full-width glass slab. The bar is solid in the page colour and the glass lives on the controls: back / forward / theme buttons share one capsule, so do the bell and friends buttons, and the search field and round buttons get the same lit rim.
- Sticky bars are solid too: a page's title bar (play button and name), the track list column header and the filter bars on Home and on search results meet without a seam and fade out below the last one.
- Sharper liquid glass: the player and the controls blur much less (4px instead of 18px) and tint less, so you can see what is underneath. The edge catches the light all round. Menus and dialogs, which carry text, keep a stronger blur and a denser tint.
- On the lyrics page, the blurred cover now runs up behind the top bar, and the lyrics fade out under it.

### Fixed
- Notification dots on the bell, on the profile photo and in the What's New feed were grey. They take the accent colour now.
- Rows showed through a playlist's title bar while it faded in, and between the title bar and the column header.
- Grey square behind the Marketplace button.
- macOS: the top bar's glass capsules, the round Marketplace button and the solid filter bar on Home did not apply, because Spotify's class names differ on macOS. They now match on structure.

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
