#include <stdio.h>

class jaanawara
{
public:
	virtual void likhoa()
	{
		printf("यह एक जानवर है।\n");
	}
};

class shaeera : public jaanawara
{
public:
	void likhoa()
	{
		printf("शेर एक जानवर है।\n");
	}
};

class chee_taa : public jaanawara
{
public:
	void likhoa()
	{
		printf("चीता एक जानवर है।\n");
	}
};

int main()
{
	jaanawara ja, *ja1;
	shaeera sha;
	chee_taa cha;

	ja.likhoa();
	sha.likhoa();
	cha.likhoa();

	ja1=&ja;
	ja1->likhoa();
	ja1=&sha;
	ja1->likhoa();
	ja1=&cha;
	ja1->likhoa();

	return 0;
}
