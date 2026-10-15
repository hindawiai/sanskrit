/* Hindawi/ILM algorithm seed: in-place introspection-friendly quicksort core.
 * Standalone educational implementation; original code for this repository.
 * Uses three-way partitioning to handle duplicate-heavy inputs robustly.
 */
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <limits.h>

static void swap_int(int *a, int *b) { int t=*a; *a=*b; *b=t; }
static void insertion_sort(int *a, size_t lo, size_t hi) {
    for (size_t i=lo+1; i<hi; ++i) { int v=a[i]; size_t j=i; while(j>lo && a[j-1]>v){a[j]=a[j-1];--j;} a[j]=v; }
}
static void sift_down(int *a, size_t base, size_t n, size_t root) {
    for (;;) { size_t child=root*2+1; if(child>=n) return; if(child+1<n && a[base+child]<a[base+child+1]) ++child; if(a[base+root]>=a[base+child]) return; swap_int(&a[base+root],&a[base+child]); root=child; }
}
static void heap_sort(int *a, size_t lo, size_t hi) {
    size_t n=hi-lo; if(n<2) return;
    for(size_t i=n/2;i>0;--i) sift_down(a,lo,n,i-1);
    for(size_t end=n;end>1;--end){swap_int(&a[lo],&a[lo+end-1]);sift_down(a,lo,end-1,0);}
}
static size_t median3(int *a, size_t x, size_t y, size_t z) {
    if(a[x]<a[y]) { if(a[y]<a[z]) return y; return a[x]<a[z]?z:x; }
    if (a[x] < a[z]) return x;
    return a[y] < a[z] ? z : y;
}
static void quicksort_impl(int *a, size_t lo, size_t hi, unsigned depth) {
    while(hi-lo>16) {
        if(depth==0){heap_sort(a,lo,hi);return;} --depth;
        size_t mid=lo+(hi-lo)/2, p=median3(a,lo,mid,hi-1); int pivot=a[p];
        size_t lt=lo, i=lo, gt=hi;
        while(i<gt){if(a[i]<pivot){swap_int(&a[lt++],&a[i++]);}else if(a[i]>pivot){swap_int(&a[i],&a[--gt]);}else ++i;}
        /* Recurse on smaller side; loop on larger side to bound stack depth. */
        if(lt-lo < hi-gt){quicksort_impl(a,lo,lt,depth);lo=gt;}else{quicksort_impl(a,gt,hi,depth);hi=lt;}
    }
    if(hi>lo) insertion_sort(a,lo,hi);
}
void ilm_quicksort(int *a, size_t n) {
    if(!a || n<2) return;
    unsigned lg=0; for(size_t m=n;m>1;m>>=1) ++lg;
    quicksort_impl(a,0,n,2*lg);
}
#ifdef ILM_QUICKSORT_TEST
static int sorted(const int *a,size_t n){for(size_t i=1;i<n;i++)if(a[i-1]>a[i])return 0;return 1;}
int main(void){
 int a[]={9,1,5,5,-2,0,INT_MAX,INT_MIN,9,3}; ilm_quicksort(a,sizeof a/sizeof a[0]); if(!sorted(a,sizeof a/sizeof a[0])) return 1;
 int b[]={7,7,7,7,7}; ilm_quicksort(b,5); if(!sorted(b,5)) return 2;
 ilm_quicksort(NULL,0);
 puts("quicksort tests: PASS (mixed, duplicates, integer extremes, empty length)"); return 0;
}
#endif
