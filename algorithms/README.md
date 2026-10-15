# Algorithm reference implementations

`quicksort.c` is an original, testable C implementation using three-way partitioning, median-of-three pivot selection, insertion sort for small partitions, and a heapsort fallback at a depth limit. The fallback prevents pathological quadratic-time behavior from unbounded partition degeneration; average quicksort time remains O(n log n), worst-case time is O(n log n) with the fallback, auxiliary stack is bounded by smaller-side recursion, and the implementation is in-place.

Build and test:

```sh
cc -std=c11 -Wall -Wextra -Werror -DILM_QUICKSORT_TEST algorithms/quicksort.c -o /tmp/ilm-quicksort
/tmp/ilm-quicksort
```

This is a seed for an algorithm conformance suite, not a claim that the full algorithms library is complete. Expand with binary search, stable merge sort, heaps, graph traversal, shortest paths, dynamic programming, hashing, and numeric algorithms, each with language-neutral specifications and per-backend tests.
