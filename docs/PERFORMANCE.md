# Performance validation

The list uses a virtualized `FlatList` with a 12-item initial window, batch rendering and clipped subviews. The included fixture set contains 1,200 launches for repeatable profiling.

Before submission, capture simulator/device evidence for: cold cached load, sustained list FPS, memory during scroll, bundle size and React DevTools profiler. These measurements must be recorded on the target device/build; no fabricated values are included here.
