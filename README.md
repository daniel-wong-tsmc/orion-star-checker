# Night Atlas

A stargazing web app for iPhone. Point the phone at the sky and it labels stars, planets, the Moon and 16 constellations for Alhambra, California. When the phone is held on Polaris (the North Star) for a moment, it shows the surprise message.

No Mac or App Store needed. It runs in Safari and can be added to the home screen so it opens like a normal app.

## Put it on your phone

1. On GitHub, open this repo, go to Settings, then Pages.
2. Under "Build and deployment", choose "Deploy from a branch", pick `claude/optimistic-knuth-80b5zc` and `/ (root)`, then Save.
3. After a minute or two the app is live at https://daniel-wong-tsmc.github.io/orion-star-checker/
4. Open that link in Safari on your iPhone, tap Share, then "Add to Home Screen".
5. Open it from the home screen, tap "Start stargazing" and allow motion access.

## Hidden controls (only you know these)

| Action | What it does |
| --- | --- |
| Hold "Night Atlas" (top left) for 1.5 s | Fires the moment by hand. Use this if the compass misbehaves. |
| Tap the heading readout at the bottom 3 times | Opens settings: calibration, trigger zone size, hold time, test, re-arm. |
| Tap the message screen 3 times | Closes it and re-arms the trigger. |

## How the trigger works

The app reads the compass and tilt sensors. Polaris sits due north at about 35° above the horizon in Alhambra. When the back of the phone points within the trigger zone (default ±12°) for the hold time (default 1.5 s), the ring around the crosshair fills and the message appears. It does not need to see the star, so it still works if it is hazy.

## Rehearsal checklist

- Go to the exact spot a few nights before, around the same time.
- Open settings (triple tap the heading). Aim the back of the phone at Polaris and tap "Calibrate on Polaris". This fixes compass error at that location.
- Test the full flow, then tap "Re-arm".
- Stand away from cars, metal railings and big speakers. They throw the compass off.
- On the night: charge the phone, turn on Do Not Disturb, lock screen rotation to portrait, and open the app once while you still have signal.
