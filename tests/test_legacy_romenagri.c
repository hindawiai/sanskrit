/* Compatibility probes for the vendored 2004-era Romenagri C kernel.
 * These assert observed legacy semantics; they do not redefine the
 * Rahnuma-derived Python word-level profile as byte-compatible.
 */
#include <stdio.h>
#include <string.h>
#include "acii2rmn.h"
#include "rmn2acii.h"

char msg2[10240];
char *msg = msg2;

static int check_decoder_byte(const char *label, unsigned char value, const char *expected) {
    char input[2];
    char *decoded;
    input[0] = (char)value;
    input[1] = '\0';
    decoded = acii2rmn(input);
    if (strcmp(decoded, expected) != 0) {
        fprintf(stderr, "FAIL %s expected=[%s] got=[%s]\n", label, expected, decoded);
        return 1;
    }
    printf("PASS %-24s ACII=0x%02X output=[%s]\n", label, value, decoded);
    return 0;
}

static int check_known_gap(const char *input, const char *expected) {
    char text[1024];
    char acii[1024];
    char *encoded;
    char *decoded;
    size_t n = strlen(input);
    memcpy(text, input, n);
    text[n] = ' ';
    text[n + 1] = '\0';
    encoded = rmn2acii(text);
    strcpy(acii, encoded);
    decoded = acii2rmn(acii);
    if (strcmp(decoded, expected) != 0) {
        fprintf(stderr, "FAIL known-gap characterization input=[%s] expected=[%s] got=[%s]\n", input, expected, decoded);
        return 1;
    }
    printf("KNOWN GAP reverse parser accepts [_3] as [%s], while ACII byte 0xEB decodes to [_3]\n", decoded);
    return 0;
}

static int check(const char *label, const char *input, const char *expected) {
    char text[1024];
    char acii[1024];
    char *encoded;
    char *decoded;
    size_t n = strlen(input);
    if (n + 2 >= sizeof(text)) {
        fprintf(stderr, "FAIL %s: input too long\n", label);
        return 1;
    }
    memcpy(text, input, n);
    text[n] = ' '; /* parser uses look-ahead; mirror the upstream test driver */
    text[n + 1] = '\0';
    encoded = rmn2acii(text);
    if (strlen(encoded) + 1 > sizeof(acii)) {
        fprintf(stderr, "FAIL %s: encoded buffer too long\n", label);
        return 1;
    }
    strcpy(acii, encoded);
    decoded = acii2rmn(acii);
    if (strcmp(decoded, expected) != 0) {
        fprintf(stderr, "FAIL %s input=%s expected=[%s] got=[%s]\n", label, input, expected, decoded);
        return 1;
    }
    printf("PASS %-24s input=[%s] output=[%s]\n", label, input, decoded);
    return 0;
}

int main(void) {
    int failures = 0;
    failures += check("bare stem means inherent", "k", "ka ");
    failures += check("explicit halant marker", "k^", "k ");
    failures += check("Grok vector चेत्", "chaee_t", "chaee_ta ");
    failures += check("Grok vector सर्वम्", "sarwam", "sarwama ");
    failures += check("Grok vector पापम्", "paapam", "paapama ");
    failures += check("Grok vector उद्धरणम्", "_u_d_dhara_nnam", "_u_d_dhara_nnama ");
    failures += check("explicit dental halant", "chaee_t^", "chaee_t ");
    failures += check("aspirate versus cluster", "kha", "kha ");
    failures += check("cluster with explicit halant", "k_ha", "k_ha ");
    failures += check_decoder_byte("avagraha ACII decode", 0xEB, "_3");
    failures += check_known_gap("_3", "3 ");
    if (failures) {
        fprintf(stderr, "legacy Romenagri probes failed: %d\n", failures);
        return 1;
    }
    puts("legacy Romenagri C probes passed; terminal-stem profile boundary recorded");
    return 0;
}
