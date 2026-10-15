# BUILD-0025 dependency audit

## Available

| tool | version |
|---|---|
| python3 | 3.10.21 |
| gcc | 12.2.0 |
| g++ | 12.2.0 |
| make | 4.3 |
| rustc | 1.98.1 |
| cargo | 1.98.1 |

## Unavailable

| tool | reason |
|---|---|
| flex | not installed; apt-get blocked by permission (setgroups/setegid failures) |

## Not required for this run

- rustc/cargo were available and used.
- Network was available for cargo dependency resolution (bitflags downloaded).
