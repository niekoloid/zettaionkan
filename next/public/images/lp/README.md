# LP Images

The AI image generation service was temporarily unavailable during the creation of this page.
Please place the following images in this directory (`public/images/lp/`) to replace the placeholders:

1.  **hero_visual.webp**
    *   **Subject**: Parent and child smiling at each other, smartphone with yellow cat.
    *   **Style**: Photorealistic, warm, soft bokeh.
    *   **Size**: ~1200x800px (or similar aspect ratio).

2.  **pain_visual.webp**
    *   **Subject**: Stressed parent in a messy living room.
    *   **Style**: Desaturated illustration, gloomy but relatable.
    *   **Size**: ~800x800px.

3.  **solution_visual.webp**
    *   **Subject**: Smartphone screen popping out with 'train' and 'cat' characters.
    *   **Style**: Dynamic, 3D effect, colorful.
    *   **Size**: ~800x600px.

## How to enable
Once you have these files, update `app/pages/lp/index.vue`:
Search for `src="https://placehold.co/..."` and replace with `/images/lp/hero_visual.webp`, etc.
