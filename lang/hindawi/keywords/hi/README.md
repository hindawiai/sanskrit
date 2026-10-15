# Hindi C keyword pack

This directory is reserved for the **existing, canonical Hindawi Hindi keyword inventory**. The current integration archive does not contain the original keyword table or full Hindawi Guru source, so this pack deliberately does not invent or overwrite that inventory. Import it from the real Chintamani/Hindawi source and preserve source provenance, spelling, token boundaries, and license.

Do not implement Hindi keywords as C `#define` aliases: macro expansion erases the original source token from ordinary compiler diagnostics and makes low-level debugging harder. Use the Hindawi front-end/translation path and emit source maps.
