#include <stdio.h>

int main()
{
	char _a[80];
	int ka;
	printf("आपका नाम क्या है?\n");
	scanf("%s",_a);
	printf("नमस्ते %s.\n",_a);
	for(ka=1; ka<=10; ka++)
		printf("%d\n",ka);
	scanf("%s",_a);
	return 0;
}
