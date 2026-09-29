# TEDxNITK Surathkal – Front Page Redesign

Responsive redesign of the TEDxNITK Surathkal landing page in TEDx red, black and white.

## Features
- Hero with interactive embers (follow the cursor, click to burst)
- Live countdown, animated stat counters, 3D tilt cards
- Speaker flip cards, scrolling marquee, cursor glow, scroll progress bar
- Registration form with validation and NITK / non-NITK conditional fields
- Mobile menu, keyboard focus styles, reduced-motion support

## Run
Open `index.html` in a browser, or with Python:

    pip install -r requirements.txt
    python app.py        # http://127.0.0.1:5000

## Edit
- Event date: `data-date` on `#clock` in `index.html`
- Colours: CSS variables at the top of `style.css`
