# Forklift tablet screen rest

The `/dock` screen rests after 30 minutes without touch, pointer, keyboard, input,
or wheel activity. There is no operator timing bar or manual rest button.
Change `DOCK_IDLE_MINUTES` in `lib/dock-config.ts` and redeploy if a different
interval is requested. Old browser timing preferences no longer override it.
The timer still runs with the top bar hidden.

Touch anywhere on the black screen once to return to the same job and step.
The app ignores input for 0.5 seconds after dismissal or browser wake/resume.
A touch started during that window stays blocked until all fingers lift; its
resulting click is also blocked. A new touch after the guard works normally,
with no extra Resume button. The form, photos and
signature remain mounted; this is not a page reload, logout or saved job backup.
Keyboard users can press Enter, Space or Escape to return.

Wake detection uses browser visibility and page-resume events. Moving focus
between the tablet simulator, its toolbar, or a file picker does not activate
the guard. The simulator toolbar remains usable while the embedded dock owns
its own wake protection. Physical
screen-off wake must still be tested in the actual tablet/browser or kiosk app;
a browser that does not report wake needs device-level integration. This guard
does not itself enable Android screen-off or double-tap wake.

Keep the dock's stay-awake control enabled (it displays **Screen Lock: OFF**).
Use the installed app over HTTPS to cover the browser chrome as well. Browser
wake lock can be refused or released by Android, such as during battery saving;
if Android itself locks the tablet, its normal wake/unlock procedure applies.

## Samsung Galaxy Tab Active5

Checked September 2026: Samsung specifies Android 14 (One UI 6) with an 8.0" 120Hz WUXGA display.
The Tab Active5 features native "Double tap to turn on screen" (Settings > Advanced features > Motions and gestures)
and high-sensitivity Glove Mode (Settings > Display > Touch sensitivity).

The 30-minute idle default is an operational starting point for the `/dock` web terminal.
When mounted in the vehicle dock:
- **Pogo Dock & Active Battery Workflow:** The 5,050 mAh battery remains inside the tablet. When seated in the RAM® Form-Fit Powered Pogo Dock (`RAM-HOL-SAM60CPU`), the tablet continuously auto-charges from the forklift. When the operator needs to take cargo photos or collect driver signatures, they snap the tablet out in 1 second, operate completely untethered on battery, and drop it back into the cradle to resume charging.
- **Screen Wake & Touch Sensitivity:** Ensure "Touch sensitivity" is turned ON in Display Settings for leather work gloves.
- **Physical Active Key:** Can be configured to wake the screen or directly bring ReworkFlow to the foreground.

Sources:
- [Samsung Galaxy Tab Active5 Specifications](https://www.samsung.com/us/business/mobile/tablets/galaxy-tab-active/galaxy-tab-active5-128gb-black-wi-fi-sm-x300nzgan20/)
- [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
